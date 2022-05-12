"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
};

// Hitboxes in the game
const wallMeshes = []; 
const portals = [];
const ghostHitboxes = [];
const pointHitboxes = [];
const powerUpHitboxes = [];
const pacmanHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
pacmanHitbox.name = "pacman_hitbox";
//pacmanHitbox.setFromObject(ghost);

// Game control properties
var gameIsReady = false;
const ghosts = [];
const GHOST_COLORS = [
    [0xF80404,0xA30404],
    [0xF8ACF4,0xA3ACF4],
    [0x08F8F4,0x08F8A0],
    [0xF8AC4C,0xA3AC4C]
]

// Map properties
const BLOCK_SIZE = 5;
// Length of the level for X and Z in terms of "blocks"
// Each block is 5x5 in area
var levelWidth = 0;
var levelHeight = 0;
// Length in terms of coordinates
var levelWidthCoord = 0;
var levelHeightCoord = 0;
const pacmanSpawnPoint = new THREE.Vector3();
const ghostSpawnPoint = new THREE.Vector3();
const level = [];

// Functions are called
//  1. Initialize the level
//  2. Animate

loadLevel("level_1");
//load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false;
var mouseDown = false, mouseUp = true;
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.onmousemove = handleMouseMove;

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}
function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = true;
            break;
        case 83: //s
            keyS = true;
            break;
        case 65: //a
            keyA = true;
            break;
        case 87: //w
            keyW = true;
            break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = false;
            break;
        case 83: //s
            keyS = false;
            break;
        case 65: //a
            keyA = false;
            break;
        case 87: //w
            keyW = false;
            break;
    }
}
function onMouseDown(){
    mouseDown = true;
    mouseUp = false;
}
function onMouseUp(){
    mouseUp = true;
    mouseDown = false;
}
//////////////////////////////////////////////////////////////////


function loadLevel(levelName){
    helper.initEmptyScene(sceneElements);

    gameIsReady = false;

    // Calculate how many blocks the map has

    const levelMap = levels.getLevel(levelName)

    // Read Map and format it
    var i = 0;
    var k = 0;
    var line = "";

    for(i = 0; i < levelMap.length; i++){
        line = "";
        for(k = 0; k < levelMap[0].length; k+=2){
            line += levelMap[i][k];
        }
        level.push(line);
    }

    levelWidth = level[0].length;
    levelHeight = level.length;
    const levelWidthCoord = levelWidth * BLOCK_SIZE;
    const levelHeightCoord = levelHeight * BLOCK_SIZE;
    // ************************** //
    // Create ground
    // ************************** //
    const ground = models.createGround(levelWidthCoord, levelHeightCoord);
    
    // Change orientation of the ground using rotation
    ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    ground.receiveShadow = true;
    ground.position.set(levelWidthCoord / 2, 0, levelHeightCoord / 2);
    sceneElements.sceneGraph.add(ground);

    // ************************** //
    // Illumination
    // ************************** //

    // Ambient light
    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
    sceneElements.sceneGraph.add(ambientLight);

    // PointLight (with shadows)
    const lightCenter = new THREE.PointLight('rgb(255, 255, 255)', 0.4, 1000);
    lightCenter.position.set(levelWidthCoord / 2, 100, levelHeightCoord / 2);
    sceneElements.sceneGraph.add(lightCenter);
    lightCenter.name = "light_center";

    // Setup shadow properties for the PointLight
    lightCenter.castShadow = true;
    lightCenter.shadow.mapSize.width = 2048;
    lightCenter.shadow.mapSize.height = 2048;
    /*
    const lightSphereGeometry = new THREE.SphereGeometry( 2, 16, 8 );
    const lightSphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const lightCenterMesh = new THREE.Mesh( lightSphereGeometry, lightSphereMaterial );
    lightCenter.add(lightCenterMesh);
    */ 

    // Other lights
    const lightBR = new THREE.PointLight('rgb(255, 255, 255)', 0.2, 1000);
    lightBR.position.set(0, 100, 0);
    sceneElements.sceneGraph.add(lightBR);
    lightBR.name = "light_bottomright";

    const lightBL = new THREE.PointLight('rgb(255, 255, 255)', 0.2, 1000);
    lightBL.position.set(levelWidthCoord, 100, 0);
    sceneElements.sceneGraph.add(lightBL);
    lightBL.name = "light_bottomleft";

    const lightTR = new THREE.PointLight('rgb(255, 255, 255)', 0.2, 1000);
    lightTR.position.set(0, 100, levelHeightCoord);
    sceneElements.sceneGraph.add(lightTR);
    lightTR.name = "light_topright";

    const lightTL = new THREE.PointLight('rgb(255, 255, 255)', 0.2, 1000);
    lightTL.position.set(levelWidthCoord, 100, levelHeightCoord);
    sceneElements.sceneGraph.add(lightTL);
    lightTL.name = "light_topleft";


    // ************************** //
    // Generate Map
    // ************************** //

    var char = 0;
    var wallN = 0;
    var pointN = 0;
    var powerUpN = 0;
    var ghostN = 0;
    for(line = 0; line < level.length; line++){
        for(char = 0; char < level[0].length; char++){
            switch(level[line][char]){
                case " ":
                    // Space
                    break;
                case "#":
                    const wall = models.createWall(wallN, BLOCK_SIZE);
                    wallN++;
                    wall.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 2, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    wallMeshes.push(wall);
                    sceneElements.sceneGraph.add(wall);
                    break;
                case ".":
                    // Point
                    const point = models.createPoint(pointN);
                    pointN++;
                    sceneElements.sceneGraph.add(point);
                    point.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    // Hitbox
                    const pointHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                    pointHitbox.name = point.name + "_hitbox";
                    pointHitbox.setFromObject(point);
                    pointHitboxes.push(pointHitbox);
                    break;
                case "o":
                    // Power Up
                    const powerUp = new models.createPowerUp(powerUpN);
                    powerUpN++;
                    powerUp.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    sceneElements.sceneGraph.add(powerUp);
                    // Hitbox
                    const powerUpHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                    powerUpHitbox.name = powerUp.name + "_hitbox";
                    powerUpHitbox.setFromObject(powerUp);
                    powerUpHitboxes.push(powerUpHitbox);
                    break;
                case "P":
                    // Pacman Spawn
                    pacmanSpawnPoint.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2)
                    break;
                case "G":
                    // Ghost Spawn
                    ghostSpawnPoint.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2)
                    break;
                case "F":
                    // Fruit
                    // Not implemented
                    break;
                default:
                    // Portal
                    const portal = {};
                    portal.num = level[line][char];
                    if(portals.find((p) => (p.num === level[line][char])))
                        portal.type = "B";
                    else
                        portal.type = "A";
                    portals.push(portal);
                    break;
            }
        }
    }
    // ************************** //
    // Create Pacman
    // ************************** //
    const pacman = models.createPacman(sceneElements.camera);

    // Hitbox
    const pacmanHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    pacmanHitbox.name = "pacman_hitbox";
    pacmanHitbox.setFromObject(pacman);

    pacman.translateY(1.5);
    pacman.position.copy(pacmanSpawnPoint);
    sceneElements.sceneGraph.add(pacman);
    
    
    pacman.rotation.x = -Math.PI/2;
    

    // ************************** //
    // Create Ghosts
    // ************************** //
    GHOST_COLORS.forEach(ghostColor => {
        const ghost = models.createGhost(ghostN, ghostColor[0], ghostColor[1]);
        ghostN++;
        sceneElements.sceneGraph.add(ghost);
        ghost.position.copy(pacmanSpawnPoint);
        ghost.translateX(2*ghostN);
        //ghost.position.copy(ghostSpawnPoint);
        ghost.rotateY(Math.PI);

        // Hitbox
        const ghostHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        ghostHitbox.name = ghost.name + "_hitbox";
        ghostHitbox.setFromObject(ghost);
        ghostHitboxes.push(ghostHitbox);
    });

    gameIsReady = true;
}

// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // ************************** //
    // PowerUp
    // ************************** //
    


    // ************************** //
    // Ghost
    // ************************** //
    
}

function getRandomPosition(radius, y){
    // for x and z to be inside of the circle:
    // x^2 + z^2 < radius

    // assign x a value from 0 to radius
    var x = Math.random() * radius;

    // assign z a value from 0 to square root of (radius^2 - x^2)
    var z = Math.random() * Math.sqrt(radius*radius - x*x);

    // make x and z positive or negative

    if (Math.floor(Math.random() * 2) - 1 < 0 )
        x *= -1;
    if (Math.floor(Math.random() * 2) - 1 < 0 )
        z *= -1;

    return new THREE.Vector3(x, y, z);
}

var mouseX = 0;
var mouseY = 0;
var sensitivityX = 0.005;
var axisVertical = new THREE.Vector3(0, 1, 0);
var axis = new THREE.Vector3(0, 0, 1);

// Adapted from how Unity Engine works for a third person camera
function handleMouseMove(e) {
    e.preventDefault();

    if(mouseDown){
        var deltaY = e.clientY - mouseY;
        mouseY = e.clientY;
        pacman.rotateOnAxis(axis, deltaY * sensitivityX);
    }
   
    // Get the difference between the previous coordinates
    var deltaX = e.clientX - mouseX;
    mouseX = e.clientX;
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    //pacman.rotateOnAxis(axisVertical, -deltaX * sensitivityX);
}


// Displacement value

var delta;
var dispX = 10, dispZ = 10;
var lastTime = 0;



const raycaster = new THREE.Raycaster();
const sceneMeshes = new Array();
var cameraWorldPos = new THREE.Vector3();
let dir = new THREE.Vector3();
let cameraDefaultPos = new THREE.Vector3(0, 5, 10);
let distance = cameraWorldPos.distanceTo(cameraDefaultPos);
let intersects = [];

function computeFrame(time) {
    delta = (time - lastTime) / 1000;
    lastTime = time;
    /*
    
    
    ADD GAME IS READY CONDITION


    */
    

    // ************************** //
    // Pacman
    // ************************** //
    const pacmanModel = sceneElements.sceneGraph.getObjectByName("pacmanModel");
    
    // Mouth animation
    var phiLength = pacmanModel.geometry.parameters.phiLength;
    phiLength += pacmanModel.mouthSpeed * delta;    
    if (phiLength <= pacmanModel.MOUTH_MIN_OPENED){
        pacmanModel.mouthSpeed *= -1;
        phiLength = pacmanModel.MOUTH_MIN_OPENED;
    }
    else if(phiLength >= pacmanModel.MOUTH_MAX_OPENED){
        pacmanModel.mouthSpeed *= -1;
        phiLength = pacmanModel.MOUTH_MAX_OPENED;
    }
    const pacmanEyes = sceneElements.sceneGraph.getObjectByName("pacmanEyes");
    pacmanEyes.rotation.y += pacmanModel.mouthSpeed * delta;
    if (pacmanEyes.rotation.y < pacmanModel.EYES_MIN_ROTATION){
        pacmanEyes.rotation.y = pacmanModel.EYES_MIN_ROTATION;
    }
    else if(pacmanEyes.rotation.y > pacmanModel.EYES_MAX_ROTATION){
        pacmanEyes.rotation.y = pacmanModel.EYES_MAX_ROTATION;
    }
    const pacmanGeometry = new THREE.SphereGeometry( 1, 32, 16, 0.314, phiLength );
    pacmanModel.geometry = pacmanGeometry;
    // Bobbing animation
    pacmanModel.position.y += pacmanModel.bobSpeed * delta;
    if(pacmanModel.position.y <= pacmanModel.BOB_MIN_HEIGHT){
        pacmanModel.bobSpeed *= -1;
        pacmanModel.position.y = pacmanModel.BOB_MIN_HEIGHT;
    }
    else if(pacmanModel.position.y >= pacmanModel.BOB_MAX_HEIGHT){
        pacmanModel.bobSpeed *= -1;
        pacmanModel.position.y = pacmanModel.BOB_MAX_HEIGHT;
    }

    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    
    if (keyD ) {
        pacman.translateX(pacman.MOV_SPEED_X * delta);
    }
    if (keyW ) {
        pacman.translateZ(-pacman.MOV_SPEED_Z * delta);
    }
    if (keyA ) {
        pacman.translateX(-pacman.MOV_SPEED_X * delta);
    }
    if (keyS ) {
        pacman.translateZ(pacman.MOV_SPEED_Z * delta);
    }
    sceneElements.camera.lookAt(pacman.position);

    // ************************** //
    // Camera
    // ************************** //
    // Adapted from
    // https://sbcode.net/threejs/raycaster2/
    /*
    sceneElements.camera.getWorldPosition(cameraWorldPos);
    dir.subVectors(cameraWorldPos, pacman.position).normalize();
    raycaster.set(pacman.position, dir);
    intersects = raycaster.intersectObjects(wallMeshes, false);
    if (intersects.length > 0) {
        if (intersects[0].distance < distance) {
            sceneElements.sceneGraph.attach(sceneElements.camera);
            sceneElements.camera.position.copy(intersects[0].point);
            pacman.attach(sceneElements.camera);
        }else{
            sceneElements.camera.position.copy(cameraDefaultPos);
        }
    }else{
        sceneElements.camera.position.copy(cameraDefaultPos);
    }
    
    */
    checkCollisions();
    // ************************** //
    // Ghost
    // ************************** //
    const ghost = sceneElements.sceneGraph.getObjectByName("ghost_1");
    const ghostTail = sceneElements.sceneGraph.getObjectByName("ghost_1_tail");
    ghostTail.traverse( (child) => {
        if(child.position.y <= ghostTail.MIN_HEIGHT){
            child.position.y = 0;
            child.scale.set(1, 1, 1);
        }
        child.translateY((Math.random()*ghostTail.MAX_SPEED + ghostTail.MIN_SPEED) * delta * -1);
        child.scale.addScalar(ghostTail.SCALE_DOWN_SPEED*delta);
    })
    ghost.position.y += ghost.BOB_SPEED * delta;
    if(ghost.position.y <= ghost.BOB_MIN_HEIGHT){
        ghost.BOB_SPEED *= -1;
        ghost.position.y = ghost.BOB_MIN_HEIGHT;
    }
    else if(ghost.position.y >= ghost.BOB_MAX_HEIGHT){
        ghost.BOB_SPEED *= -1;
        ghost.position.y = ghost.BOB_MAX_HEIGHT;
    }


    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

function checkCollisions(){

    const pacmanModel = sceneElements.sceneGraph.getObjectByName("pacmanModel");

    

    pacmanHitbox.setFromObject(pacmanModel);
    pacmanModel.geometry.computeBoundingSphere();
    pacmanModel.geometry.boundingSphere.getBoundingBox(pacmanHitbox)
    pacmanHitbox.applyMatrix4(pacmanModel.matrixWorld);
    
    const ghost = sceneElements.sceneGraph.getObjectByName("ghost_1");
    const ghostHitbox = ghostHitboxes.find((hitbox) => hitbox.name === "ghost_1_hitbox");
    const ghostBody = sceneElements.sceneGraph.getObjectByName("ghost_1_body");
    if(ghostHitbox){
        ghostHitbox.copy(ghostBody.geometry.boundingBox).applyMatrix4(ghostBody.matrixWorld);
        if(pacmanHitbox.intersectsBox(ghostHitbox)){
            console.log("yes on ghost ");
            // remover hitbox
            //ghostHitboxes.pop(ghostHitbox);
        }
    }

    const pointHitbox = pointHitboxes.find((hitbox) => hitbox.name === "point_1_hitbox");
    if(pointHitbox){
        if(pacmanHitbox.intersectsBox(pointHitbox)){
            console.log("yes on point");
            // remover hitbox
            //ghostHitboxes.pop(ghostHitbox);
        }
    }

    const powerUpHitbox = powerUpHitboxes.find((hitbox) => hitbox.name === "powerup_1_hitbox");
    if(powerUpHitbox){
        if(pacmanHitbox.intersectsBox(powerUpHitbox)){
            console.log("yes on power up");
            // remover hitbox
            //ghostHitboxes.pop(ghostHitbox);
        }
    }

}