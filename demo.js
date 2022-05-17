"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
    miniCamera: null,
    freeCamera: null
};

// Hitboxes in the game
var wallMeshes = []; 
var portals = [];
var ghostHitboxes = [];
var pointHitboxes = [];
var powerUpHitboxes = [];
var fruitLocations = [];
var fruits = [];
var fruitHitboxes = [];
const pacmanHitbox = new THREE.Sphere();

// Game control properties
var gameIsReady = false;
var gameIsOver = false;
const ghosts = [];
const GHOST_PROPERTIES = [
    {primary: 0xF80404, secondary: 0xA30404, speed: 1.1, path: "SHORTEST"},
    {primary: 0xF8ACF4, secondary: 0xA3ACF4, speed: 1.0, path: "NEAR"},
    {primary: 0x08F8F4, secondary: 0x059997, speed: 0.95, path: "CORRIDOR"},
    {primary: 0xFF8E00, secondary: 0xA65D02, speed: 0.9, path: "RANDOM"},
    {primary: 0xFF8E00, secondary: 0xA65D02, speed: 0.9, path: "RANDOM"},
    {primary: 0xFF8E00, secondary: 0xA65D02, speed: 0.9, path: "RANDOM"}
]

const cameraGroup = new THREE.Group();
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
var totalPortals = 0;

const lightSources = [];
const LIGHT_CHECK_DELAY = 200;
var nextLightCheck = 0;
var closestLightName = "";

// Movement properties
// Game values

const FRUIT_SPAWN_INTERVAL = 30 * 1000;
var nextFruitSpawn = 0;

const POINT_SCORE = 10;
const POWERUP_SCORE = 50;
const FRUIT_SCORE = 200;


const PORTAL_COOLDOWN = 5000;
var portalCooldown = 0;
//const POWERUP_DURATION = 15 * 1000;
const POWERUP_DURATION = 15 * 1000;
//const POWERUP_SPEED = 1.5;
const POWERUP_SPEED = 1.5;
var powerUpLimit = 0;
var poweredUp = false;

var levelMapName = "";
var levelN = 1;
var ghostKills = 0;
var points = 0;
var isAlive = true;
var totalGhostKills = 0;
var totalPoints = 0;
var lives = 3;

var gameTimer = 0;
var gamePaused = true;
var DEATH_TIMER = 5000;
var deathTimer = 0;

// Settings
var dynamicCamera = true;
var mouseRotation = true;
var soundVolume = 0.25;

const element = document.querySelector("#Tag3DScene");
element.onclick = focusWindow;
// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
element.requestPointerLock = element.requestPointerLock ||
			     element.mozRequestPointerLock ||
			     element.webkitRequestPointerLock;


// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock ||
			   document.mozExitPointerLock ||
			   document.webkitExitPointerLock;

var sensitivityX = 0.005;
var sensitivityY = 0.005;
var axisVertical = new THREE.Vector3(0, 1, 0);
var axisVerticalX = new THREE.Vector3(1, 0, 0);
var axisVerticalZ = new THREE.Vector3(0, 0, 1);
var axis = new THREE.Vector3(0, 0, 1);


// Functions are called
//  1. Initialize an empty scene
//  2. Animate
helper.initEmptyScene(sceneElements);
loadSounds();
loadLevel("level_1");

cameraGroup.add(sceneElements.camera);
sceneElements.sceneGraph.add(cameraGroup);
cameraGroup.position.set(levelWidthCoord/ 2, 5, levelHeightCoord + 40);

requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false, arrowLeft = false, arrowRight = false, shift = false, space = false;
var mouseDown = false, mouseUp = true;

// Ask the browser to lock the pointer


document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
document.addEventListener("mousemove", handleMouseMove, false);

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}

//////////////////////////////////////////////////////////////////

function loadLevel(levelName){
    gameIsReady = false;
    levelMapName = levelName;
    // Calculate how many blocks the map has
    const levelMap = levels.getLevel(levelName)
    // Read Map and format it
    var i = 0;
    var k = 0;
    var line = "";
    level.splice(0, level.length);
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
    const ground = models.createGround(levelWidthCoord*2, levelHeightCoord*2);
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
    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.6);
    ambientLight.name = "ambientLight";
    ambientLight.MAX_INTENSITY = 1;
    ambientLight.MIN_INTENSITY = 0.6;
    ambientLight.SPEED = 0.4;
    sceneElements.sceneGraph.add(ambientLight);
    // PointLight (with shadows)
    const lightCenter = new THREE.PointLight('rgb(255, 255, 255)', 1, 1000);
    lightCenter.position.set(levelWidthCoord / 2, 200, levelHeightCoord / 2);
    sceneElements.sceneGraph.add(lightCenter);
    lightCenter.name = "light_center";
    // Setup shadow properties for the PointLight
    lightCenter.castShadow = true;
    lightCenter.shadow.mapSize.width = 2048;
    lightCenter.shadow.mapSize.height = 2048;
    // ************************** //
    // Generate Map
    // ************************** //
    var char = 0;
    var wallN = 0;
    var pointN = 0;
    var powerUpN = 0;
    var ghostN = 0;
    var portalsN = 0;
    for(line = 0; line < level.length; line++){
        for(char = 0; char < level[0].length; char++){
            switch(level[line][char]){
                case " ":
                case "-":
                case "P":
                case "G":
                case "F":
                    break;
                case "#":
                    const wall = models.createWall(wallN, BLOCK_SIZE);
                    wallN++;
                    wall.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 2, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    sceneElements.sceneGraph.add(wall);
                    break;
                case ".":
                    // Point
                    const point = models.createPoint(pointN);
                    pointN++;
                    sceneElements.sceneGraph.add(point);
                    point.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    break;
                case "o":
                    // Power Up
                    const powerUp = new models.createPowerUp(powerUpN);
                    powerUpN++;
                    powerUp.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    sceneElements.sceneGraph.add(powerUp);
                    // Hitbox
                    break;
                default:
                    // Portal
                    const portal = models.createPortal(2, BLOCK_SIZE);
                    portalsN++;
                    portal.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 2, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    sceneElements.sceneGraph.add(portal);
                    break;
            }
        }
    }
    // ************************** //
    // Create Pacman
    // ************************** //
    const pacman = models.createPacman(sceneElements.freeCamera);
    pacman.position.set(levelWidthCoord/2 + 18, 2, levelHeightCoord + 20);
    pacman.rotation.y = Math.PI/2;
    sceneElements.sceneGraph.add(pacman);
    // ************************** //
    // Create Ghosts
    // ************************** //
    GHOST_PROPERTIES.forEach(g => {
        const ghost = models.createGhost(ghostN, g.primary, g.secondary);
        ghostN++;
        sceneElements.sceneGraph.add(ghost);
        ghost.position.set(levelWidthCoord/2, 2, levelHeightCoord + 20);
        ghost.translateX(ghostN*2);
        ghosts.push(ghost);
    });
    ghosts[ghosts.length-2].setScared();
    ghosts[ghosts.length-1].setDead();
    
    const point = models.createPoint(1000);
    point.position.copy(ghosts[0].position);
    point.translateX(-10);
    sceneElements.sceneGraph.add(point);
    const powerup = models.createPowerUp(1000);
    powerup.position.copy(point.position);
    powerup.translateX(-2);
    powerup.turnLightOn();
    sceneElements.sceneGraph.add(powerup);
    const fruit = models.createFruit();
    fruit.position.copy(powerup.position);
    fruit.translateX(-2);
    fruits.push(fruit);
    sceneElements.sceneGraph.add(fruit);

    const portal = models.createPortal(0, BLOCK_SIZE);
    portal.position.copy(fruit.position);
    portal.translateX(-8);
    sceneElements.sceneGraph.add(portal);
    portal.turnLightOn();
    portals.push(portal);
    totalPortals++;
}

// Displacement value
var delta;
var lastTime = 0;


// Call vital game functions and update HUD
function computeFrame(time) {
    delta = (time - lastTime) / 1000;
    lastTime = time;

    if(!document.hasFocus()){
        document.exitPointerLock();
    }
    moveCamera();
    animatePacman();
    animateGhosts();
    animatePortals();
    animateFruits();
    sceneElements.camera.lookAt(cameraGroup.position);
    // Rendering
    helper.render(sceneElements);
    // Update control of the camera
    sceneElements.control.update();
    // Call for the next frame
    requestAnimationFrame(computeFrame);
}



function handleMouseMove(e) {
    e.preventDefault();
    var axis = new THREE.Vector3(1, 0, 0);

    var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    //cameraGroup.rotation.z+= -movementY * sensitivityY;
    //cameraGroup.rotateOnAxis(axisVertical, -movementX * sensitivityX);
}
function focusWindow(){
    //element.requestPointerLock();
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
        case 16: //shift
            shift = true;
            break;
        case 32: //space
            space = true;
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
        case 16: //shift
            shift = false;
            break;
        case 32: //space
            space = false;
            break;
    }
}
function moveCamera(){
    //usar angulo da camara
    //cameraGroup.rotation.y = sceneElements.camera.rotation.y;
    //sceneElements.camera.rotation.set(0,0,0);

    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    sceneElements.camera.matrixWorld.decompose( position, quaternion, scale );
    const y = quaternion.y;
    // Front = 0 esq 0.688 dir -0.688 tras 0.97

    if (keyD){
        cameraGroup.translateX(25 * delta);

    }
    if (keyW){
        cameraGroup.translateZ(-25 * delta * (1 - y));

    }
    if (keyA){
        cameraGroup.translateX(-25 * delta);

    }
    if (keyS){
        cameraGroup.translateZ(25 * delta);

    }
    if (shift){
        cameraGroup.translateY(-25 * delta);

    }
    if (space){
        cameraGroup.translateY(25 * delta);

    }

}