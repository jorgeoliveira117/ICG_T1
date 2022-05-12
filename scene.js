"use strict";

// Taken from
// https://github.com/butchler/Pacman-3D/blob/gh-pages/game.js
var LEVEL = [
    '# # # # # # # # # # # # # # # # # # # # # # # # # # # #',
    '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
    '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
    '# o # # # # . # # # # # . # # . # # # # # . # # # # o #',
    '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
    '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
    '# . # # # # . # # . # # # # # # # # . # # . # # # # . #',
    '# . # # # # . # # . # # # # # # # # . # # . # # # # . #',
    '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
    '# # # # # # . # # # # #   # #   # # # # # . # # # # # #',
    '          # . # # # # #   # #   # # # # # . #          ',
    '          # . # #         G           # # . #          ',
    '          # . # #   # # # # # # # #   # # . #          ',
    '# # # # # # . # #   #             #   # # . # # # # # #',
    '            .       #             #       .            ',
    '# # # # # # . # #   #             #   # # . # # # # # #',
    '          # . # #   # # # # # # # #   # # . #          ',
    '          # . # #                     # # . #          ',
    '          # . # #   # # # # # # # #   # # . #          ',
    '# # # # # # . # #   # # # # # # # #   # # . # # # # # #',
    '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
    '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
    '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
    '# o . . # # . . . . . . . P   . . . . . . . # # . . o #',
    '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
    '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
    '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
    '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
    '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
    '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
    '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'
        ];


// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
};

const wallMeshes = []; 
const ghostHitboxes = [];
const pointHitboxes = [];
const powerUpHitboxes = [];
const pacmanHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
pacmanHitbox.name = "pacman_hitbox";
//pacmanHitbox.setFromObject(ghost);


// Functions are called
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate
helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
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


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // ************************** //
    // Create a ground plane
    // ************************** //
    const ground = models.createGround(100, 100);
    
    // Change orientation of the ground using rotation
    ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    ground.receiveShadow = true;
    
    sceneGraph.add(ground);
    // ************************** //
    // Wall
    // ************************** //
    const wall = models.createWall(1);
    wall.position.set(15, 3, 5);
    wall.receiveShadow = true;
    wall.name = "wall#1";
    const wall2 = models.createWall(2);
    wall2.position.set(15, 3, 10);
    const wall3 = models.createWall(3);
    wall3.position.set(5, 3, 5);
    const wall4 = models.createWall(4);
    wall4.position.set(5, 3, 10);
    const wall5 = models.createWall(5);
    wall5.position.set(200, 3, 2);
    const walls = new THREE.Group();
    walls.name = "walls";

    walls.add( wall );
    wallMeshes.push(wall);
    walls.add( wall2 );
    wallMeshes.push(wall2);
    walls.add( wall3 );
    wallMeshes.push(wall3);
    walls.add( wall4 );
    wallMeshes.push(wall4);
    walls.add( wall5 );
    wallMeshes.push(wall5);
    sceneGraph.add(walls);

    // ************************** //
    // Point
    // ************************** //
    
    const point = models.createPoint(1);
    sceneGraph.add(point);
    point.position.set(-10, 1.5, 3);

    // Hitbox
    const pointHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    pointHitbox.name = point.name + "_hitbox";
    pointHitbox.setFromObject(point);
    pointHitboxes.push(pointHitbox);

    // ************************** //
    // PowerUp
    // ************************** //
    const powerUp = new models.createPowerUp(1);
    powerUp.position.set(10, 1.5, 3);
    sceneGraph.add(powerUp);
    
    // Hitbox
    const powerUpHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    powerUpHitbox.name = powerUp.name + "_hitbox";
    powerUpHitbox.setFromObject(powerUp);
    powerUpHitboxes.push(powerUpHitbox);


    // ************************** //
    // Ghost
    // ************************** //
    const ghost = models.createGhost(1, 0xFF0000, 0xAA0000);
    sceneGraph.add(ghost);
    ghost.position.set(-2, 2, 0);
    ghost.rotateY(Math.PI);

    // Hitbox
    const ghostHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    ghostHitbox.name = ghost.name + "_hitbox";
    ghostHitbox.setFromObject(ghost);
    ghostHitboxes.push(ghostHitbox);
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
    // THE SPOT LIGHT
    // Can extract an object from the scene Graph from its name
    const light = sceneElements.sceneGraph.getObjectByName("light");
    // Apply a small displacement
    if (light.position.x >= 10) {
        delta *= -1;
    } else if (light.position.x <= -10) {
        delta *= -1;
    }
    light.translateX(delta);
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
    // ************************** //
    // Camera
    // ************************** //
    // Adapted from
    // https://sbcode.net/threejs/raycaster2/
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
    sceneElements.camera.lookAt(pacman.position);

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


    pacmanHitbox.setFromObject(pacmanModel);
    pacmanModel.geometry.computeBoundingSphere();
    pacmanModel.geometry.boundingSphere.getBoundingBox(pacmanHitbox)
    pacmanHitbox.applyMatrix4(pacmanModel.matrixWorld);
    
    const ghostHitbox = ghostHitboxes.find((hitbox) => hitbox.name === "ghost_1_hitbox");
    const ghostHitboxHelper = sceneElements.sceneGraph.getObjectByName("ghost_1_hitboxHelper");
    const ghostBody = sceneElements.sceneGraph.getObjectByName("ghost_1_body");

    
    if(ghostHitbox){
        ghostHitbox.copy(ghostBody.geometry.boundingBox).applyMatrix4(ghostBody.matrixWorld);
        ghostHitboxHelper.position.copy(ghost.position);
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


    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}