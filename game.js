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
    [0x08F8F4,0x059997],
    [0xFF8E00,0xA65D02]
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

// Movement properties
const MOVE_UP = { movement: "UP", xBias: 0, zBias: 1, rotationAngle: 0};
const MOVE_DOWN = { movement: "DOWN", xBias: 0, zBias: -1, rotationAngle: -Math.PI};
const MOVE_LEFT = { movement: "LEFT", xBias: 1, zBias: 0, rotationAngle: Math.PI / 2};
const MOVE_RIGHT = { movement: "RIGHT", xBias: -1, zBias: 0, rotationAngle: -Math.PI / 2};
const MOVE_DIRECTIONS = [MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT];

const ROTATION_ERROR = Math.PI/100;
const POSITION_ERROR = 0.1;


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
    levelWidthCoord = levelWidth * BLOCK_SIZE;
    levelHeightCoord = levelHeight * BLOCK_SIZE;
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
                case "-":
                    // Unreachable space
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
    
    
    //pacman.rotation.x = -Math.PI/2;
    

    // ************************** //
    // Create Ghosts
    // ************************** //
    GHOST_COLORS.forEach(ghostColor => {
        const ghost = models.createGhost(ghostN, ghostColor[0], ghostColor[1]);
        ghostN++;
        sceneElements.sceneGraph.add(ghost);
        
        //ghost.position.copy(pacmanSpawnPoint);

        ghost.position.copy(ghostSpawnPoint);
        //ghost.translateX(2*ghostN);

        ghost.currentBlock = getCoords(ghost.position.x, ghost.position.z);
        //ghost.rotateY(-Math.PI/2);

        if(ghostN == 1)
            ghost.PATH_FINDING = "SHORTEST";
        ghosts.push(ghost);

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
//let cameraDefaultPos = new THREE.Vector3(0, 5, 10);
//let distance = cameraWorldPos.distanceTo(pacman.CAMERA_DEFAULT_POS);
let intersects = [];
const wallCollision = {front: false, left: false, right: false, back: false}

function computeFrame(time) {
    delta = (time - lastTime) / 1000;
    lastTime = time;
    
    
    

    movePacman();
    moveGhosts();
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
        if (intersects[0].distance < pacman.CAMERA_DISTANCE) {
            sceneElements.sceneGraph.attach(sceneElements.camera);
            sceneElements.camera.position.copy(intersects[0].point);
            pacman.attach(sceneElements.camera);
        }else{
            if(pacman.position.distanceTo(cameraWorldPos) > pacman.CAMERA_DISTANCE)
                sceneElements.camera.position.copy(pacman.CAMERA_DEFAULT_POS);
            else
                sceneElements.camera.position.copy(sceneElements.camera.position.clone().addScaledVector(pacman.CAMERA_DIRECTION, pacman.CAMERA_SPEED * delta));
        }
    }else{
        if(pacman.position.distanceTo(cameraWorldPos) > pacman.CAMERA_DISTANCE)
            sceneElements.camera.position.copy(pacman.CAMERA_DEFAULT_POS);
        else
            sceneElements.camera.position.copy(sceneElements.camera.position.clone().addScaledVector(pacman.CAMERA_DIRECTION, pacman.CAMERA_SPEED * delta));
    }
    */

    checkCollisions();
    animatePacman();
    animateGhosts();

    // Rendering
    helper.render(sceneElements);

    // Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

function checkCollisions(){

    // Update Pacman's Hitbox
    const pacmanModel = sceneElements.sceneGraph.getObjectByName("pacmanModel");
    pacmanHitbox.setFromObject(pacmanModel);
    pacmanModel.geometry.computeBoundingSphere();
    pacmanModel.geometry.boundingSphere.getBoundingBox(pacmanHitbox)
    pacmanHitbox.applyMatrix4(pacmanModel.matrixWorld);
    
    // Update ghost hitboxes and check collision
    ghostHitboxes.forEach((ghostHitbox) => {
        const ghostName = ghostHitbox.name.substring(0, ghostHitbox.name.length - 7);
        const ghost = sceneElements.sceneGraph.getObjectByName(ghostName);
        const ghostBody = sceneElements.sceneGraph.getObjectByName(ghostName + "_body");
        ghostHitbox.copy(ghostBody.geometry.boundingBox).applyMatrix4(ghostBody.matrixWorld);
        if(pacmanHitbox.intersectsBox(ghostHitbox)){
            console.log("Collided with " + ghostName);
            // remover hitbox
            //ghostHitboxes.pop(ghostHitbox);
        }
    });

    // Check for collision with points
    pointHitboxes.forEach((pointHitbox) =>{
        const pointName = pointHitbox.name.substring(0, pointHitbox.name.length - 7);
        if(pacmanHitbox.intersectsBox(pointHitbox)){
            console.log("Collided with " + pointName);
            // remover hitbox
            //ghostHitboxes.pop(ghostHitbox);
        }
    });

    // Check for collision with power ups
    powerUpHitboxes.forEach((powerUpHitbox) =>{
        const powerUpName = powerUpHitbox.name.substring(0, powerUpHitbox.name.length - 7);
        if(pacmanHitbox.intersectsBox(powerUpHitbox)){
            console.log("Collided with " + powerUpName);
            // remover hitbox
            //ghostHitboxes.pop(ghostHitbox);
        }
    });
}

// Check if a side 
function checkWalls(){
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");

    // reset collisions
    wallCollision.front = false;
    wallCollision.back = false;
    wallCollision.right = false;
    wallCollision.left = false;
    
    // check front
    if(getBlock(pacman.position.x, pacman.position.z + pacman.WALL_COLLISION_RADIUS) === "#"){
        wallCollision.front = true;
        pacman.position.z -= pacman.MOV_SPEED_Z * delta * 1.2;
    }
    // check back
    if(getBlock(pacman.position.x, pacman.position.z - pacman.WALL_COLLISION_RADIUS) === "#"){
        wallCollision.back = true;
        pacman.position.z += pacman.MOV_SPEED_Z * delta * 1.2;
    }
    // check left
    if(getBlock(pacman.position.x + pacman.WALL_COLLISION_RADIUS, pacman.position.z) === "#"){
        wallCollision.left = true;
        pacman.position.x -= pacman.MOV_SPEED_X * delta * 1.2;
    }
    // check right
    if(getBlock(pacman.position.x - pacman.WALL_COLLISION_RADIUS, pacman.position.z) === "#"){
        wallCollision.right = true;
        pacman.position.x += pacman.MOV_SPEED_X * delta * 1.2;
    }
    //sphere.position.x -= pacman.WALL_COLLISION_RADIUS_FRONT;
    
}

function checkBounds(delta){
    // checks if pacman is inside a wall and smoothly moves out

    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    // check front
    if(getBlock(pacman.position.x, pacman.position.z + pacman.WALL_COLLISION_RADIUS) === "#")
        pacman.position.z -= pacman.MOV_SPEED_Z * delta * 1.2;
    // check back
    if(getBlock(pacman.position.x, pacman.position.z - pacman.WALL_COLLISION_RADIUS) === "#")
        pacman.position.z += pacman.MOV_SPEED_Z * delta * 1.2;
    // check left
    if(getBlock(pacman.position.x + pacman.WALL_COLLISION_RADIUS, pacman.position.z) === "#")
        pacman.position.x -= pacman.MOV_SPEED_X * delta * 1.2;
    // check right
    if(getBlock(pacman.position.x - pacman.WALL_COLLISION_RADIUS, pacman.position.z) === "#")
        pacman.position.x += pacman.MOV_SPEED_X * delta * 1.2;

}

function getBlock(x, z){
    // Inspired from
    // https://github.com/butchler/Pacman-3D/blob/gh-pages/game.js

    const coords = getCoords(x, z);

    return(level[coords.z][coords.x]);
}

function getBlockCenter(x, z){
    return {
        x: levelWidthCoord - x * BLOCK_SIZE - BLOCK_SIZE/2,
        z: levelHeightCoord - z * BLOCK_SIZE - BLOCK_SIZE/2
    }
}

function getCoords(x, z){
    const coords = {}

    coords.x = levelWidth - Math.floor( x / BLOCK_SIZE) - 1;
    coords.z = levelHeight - Math.floor( z / BLOCK_SIZE) - 1;

    return coords;
}


// ************************** //
// Animations
// ************************** //

function animatePacman(){
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
}

function animateGhosts(){
    ghosts.forEach((ghost) => {
        const ghostTail = sceneElements.sceneGraph.getObjectByName(ghost.name + "_tail");
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
    })
}

// ************************** //
// Movements
// ************************** //

function movePacman(){
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    checkWalls(delta);
    if (keyD && !wallCollision.right)
        pacman.translateX(pacman.MOV_SPEED_X * delta);
    if (keyW && !wallCollision.front)
        pacman.translateZ(-pacman.MOV_SPEED_Z * delta);
    if (keyA && !wallCollision.left)
        pacman.translateX(-pacman.MOV_SPEED_X * delta);
    if (keyS && !wallCollision.back)
        pacman.translateZ(pacman.MOV_SPEED_Z * delta);
    sceneElements.camera.lookAt(pacman.position);
    checkBounds(delta);
}


function lerp (start, end, amount){
    // Taken from https://codepen.io/ma77os/pen/OJPVrP
    return (1-amount) * start + amount * end;
}

function moveGhosts(){
    ghosts.forEach((ghost) => {
      
        if(ghost.path.length > 0){
            var nextPath = ghost.path[0];
            const currBlock = getCoords(ghost.position.x, ghost.position.z);
            
            // Check if ghost is in the middle of the target path block
            if(ghost.position.x > nextPath.x - POSITION_ERROR 
                && ghost.position.x < nextPath.x + POSITION_ERROR
                && ghost.position.z > nextPath.z - POSITION_ERROR 
                && ghost.position.z < nextPath.z + POSITION_ERROR){
                
                ghost.path.shift();

                // Check for direction in the new path, if there's one
                if(ghost.path.length > 0){
                    nextPath = ghost.path[0];
                    
                    console.log(ghost.position);
                    
                    ghost.currentBlock = currBlock;
                    
                    const nextPathBlock = getCoords(nextPath.x, nextPath.z);
                    
                    const direction = MOVE_DIRECTIONS.find(
                        (dir) => 
                        dir.xBias == (currBlock.x - nextPathBlock.x) 
                        && dir.zBias == (currBlock.z - nextPathBlock.z)
                        );
                        if(direction.movement !== ghost.direction.movement)
                        ghost.direction = direction;
                }
            }
            
            // Move and rotate if there's a path to follow
            if(ghost.path.length > 0){
                ghost.rotation.y = lerp(ghost.rotation.y, ghost.direction.rotationAngle, ghost.ROTATION_SPEED*delta);
                ghost.position.x += (ghost.MOV_SPEED_X * ghost.direction.xBias * delta);
                ghost.position.z += (ghost.MOV_SPEED_Z * ghost.direction.zBias * delta);
            }
            
        }
        // If the ghost doesn't have a path to follow
        if(ghost.path.length == 0){
            // If the ghost is in the same block as pacman
            const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
            const pacmanPos = getCoords(pacman.position.x, pacman.position.z);

            if(ghost.isScared)
                console.log("Scared ghost");
            else{
                if(ghost.PATH_FINDING == "SHORTEST"){
                    const path = getShortestPathToPacman(ghost.position.x, ghost.position.z);
                    
                    // Remove first element as it's not needed;
                    //path.shift(); 

                    ghost.path = path;
                }else if(ghost.PATH_FINDING == "RANDOM"){
                    const path = getRandomPath(ghost.position.x, ghost.position.z);
                    ghost.path = path;
                }
            }
        }

    });
}

function getRandomPath(x, z){

    const ghostPos = getCoords(x, z);

    const options = [];
    // Check adjacent nodes
    if(ghostPos.x > 0 && level[ghostPos.z][ghostPos.x-1] != "#")
        options.push({x: -1, z: 0, name: "LEFT"});
    if(ghostPos.x + 1 < levelWidth && level[ghostPos.z][ghostPos.x+1] != "#")
        options.push({x: 1, z: 0, name: "RIGHT"});
    if(ghostPos.z > 0 && level[ghostPos.z-1][ghostPos.x] != "#")
        options.push({x: 0, z: -1, name: "DOWN"});
    if(ghostPos.z + 1 < levelHeight && level[ghostPos.z+1][ghostPos.x] != "#")
        options.push({x: 0, z: 1, name: "UP"});

    const choice = options[Math.floor(Math.random() * options.length)];

    const coords = {x: ghostPos.x + choice.x, z: ghostPos.z + choice.z};
    const path = [ getBlockCenter(ghostPos.x, ghostPos.z), getBlockCenter(coords.x, coords.z)];
    var findingPath = true;

    
    while(findingPath){
        if(
            coords.x + choice.x > 0 && coords.x + choice.x < levelWidth && 
            coords.z + choice.z > 0 && coords.z + choice.z < levelHeight &&
            level[coords.z + choice.z][coords.x + choice.x] != "#"
        ){
            coords.x += choice.x;
            coords.z += choice.z;
            path.push(getBlockCenter(coords.x, coords.z));
        }else{
            findingPath = false;
        }
    }
    /*
*/
    console.log(path);
    return path;
}

function getShortestPathToPacman(x, z){
    // Adapted from
    // https://medium.com/@manpreetsingh.16.11.87/shortest-path-in-a-2d-array-java-653921063884
    
    // Copy the map to a new variable (Shallow copy)
    var map = [];
    var line = [];
    for(var i = 0; i < level.length; i++){
        line = [];
        for(var k = 0; k < level[0].length; k++){
            line.push(level[i][k]);
        }
        map.push(line);
    }

    // Get position in the map
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    const pacmanPos = getCoords(pacman.position.x, pacman.position.z);
    const ghostPos = getCoords(x, z);

    // Create a queue with nodes
    const sourceNode = {x: ghostPos.x, z: ghostPos.z, previous: null};
    const queue = [sourceNode];
    var popedNode, tries = 0;
    
    console.log("Finding path from [" + ghostPos.x + ", " + ghostPos.z + "] to [" + pacmanPos.x + ", " + pacmanPos.z + "]")
    while(queue.length > 0){
        tries++;
        popedNode = queue.shift();

        // Check if this Node represents the block pacman is in
        if(popedNode.x == pacmanPos.x && popedNode.z == pacmanPos.z){
            console.log("Found a path to Pacman after searching " + tries + " blocks.");
            //printPath(generatePath(popedNode));
            return generatePath(popedNode);
        }
        //console.log(popedNode)

        // Mark as a wall because it's "unwakable"
        map[popedNode.z][popedNode.x] = "#";

        // Add adjacent nodes
        if(popedNode.x > 0 && map[popedNode.z][popedNode.x-1] != "#")
            queue.push({x: popedNode.x-1, z: popedNode.z, previous: popedNode});
        if(popedNode.x + 1 < levelWidth && map[popedNode.z][popedNode.x+1] != "#")
            queue.push({x: popedNode.x+1, z: popedNode.z, previous: popedNode});
        if(popedNode.z > 0 && map[popedNode.z-1][popedNode.x] != "#")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});
        if(popedNode.z + 1 < levelHeight && map[popedNode.z+1][popedNode.x] != "#")
            queue.push({x: popedNode.x, z: popedNode.z+1, previous: popedNode});

    }


    console.log("Couldn't find a path to Pacman after searching " + tries + " blocks.");
    return [];
}

function generatePath(pathNode){
    // Generates the path from a path node
    const path = [];
    path.push(getBlockCenter(pathNode.x,pathNode.z));
    while(pathNode.previous){
        path.push(getBlockCenter(pathNode.previous.x,pathNode.previous.z));
        pathNode = pathNode.previous;
    }
    return path.reverse();
}

function printPath(path){
    var pathString = "";
    path.forEach((block) => {
            pathString += "["+ block.x + ", " + block.z + "] => ";
        });
    console.log(pathString.substring(0, pathString.length -4));
}