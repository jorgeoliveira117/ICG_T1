"use strict";

// Useful elements to the scene and game
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
    miniCamera: null
};

// ************************** //
// Hitboxes
// ************************** //
var wallMeshes = []; 
var portals = [];
var ghostHitboxes = [];
var pointHitboxes = [];
var powerUpHitboxes = [];
var fruitLocations = [];
var fruits = [];
var fruitHitboxes = [];
const pacmanHitbox = new THREE.Sphere();

// ************************** //
// Game Properties
// ************************** //
// Game control
var gameIsReady = false;
var gameIsOver = false;
var gamePaused = true;
// Time variables
var gameTimer = 0;
var delta;      // Time since last frame
var lastTime = 0;

var levelN = 1;

var totalGhostKills = 0;
var totalPoints = 0;
var ghostKills = 0;
var points = 0;
var isAlive = true;
var lives = 3;

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false, arrowLeft = false, arrowRight;
var mouseDown = false, mouseUp = true;

const ghosts = [];
const GHOST_PROPERTIES = [
    {primary: 0xF80404, secondary: 0xA30404, speed: 1.1, path: "SHORTEST"},
    {primary: 0xF8ACF4, secondary: 0xA3ACF4, speed: 1.0, path: "NEAR"},
    {primary: 0x08F8F4, secondary: 0x059997, speed: 0.95, path: "CORRIDOR"},
    {primary: 0xFF8E00, secondary: 0xA65D02, speed: 0.9, path: "RANDOM"}
]
// How much the speed changes on each difficulty
const PACMAN_SPEED_MODIFIER = 0.1;
const GHOST_SPEED_MODIFIER = 0.1;
// When the fruit spawns and its "cooldown"
const FRUIT_SPAWN_INTERVAL = 30 * 1000;
var nextFruitSpawn = 0;
// How much every "collectible" gives as score
const POINT_SCORE = 10;
const POWERUP_SCORE = 50;
const FRUIT_SCORE = 200;
// Portal Cooldown
const PORTAL_COOLDOWN = 5000;
var portalCooldown = 0;
// Power Up properties
const POWERUP_DURATION = 15 * 1000;
const POWERUP_SPEED = 1.5;
var powerUpLimit = 0;
var poweredUp = false;
// Death Timer
var DEATH_TIMER = 5000;
var deathTimer = 0;



// ************************** //
// Map Properties
// ************************** //
const BLOCK_SIZE = 5;
// Length of the level for X and Z in terms of "blocks"
// aka Length in terms of Map coordinates
var levelWidth = 0;
var levelHeight = 0;
// Length in terms of World coordinates
var levelWidthCoord = 0;
var levelHeightCoord = 0;
const pacmanSpawnPoint = new THREE.Vector3();
const ghostSpawnPoint = new THREE.Vector3();
// array to store the map
const level = [];
var levelMapName = "";
var totalPortals = 0;
// Useful variables that allow the check of near lights
const lightSources = [];
const LIGHT_CHECK_DELAY = 200;
var nextLightCheck = 0;
var closestLightName = "";


// ************************** //
// Game Settings
// ************************** //
var dynamicCamera = true;
var mouseRotation = true;
var sensitivityX = 0.005;
var soundVolume = 0.25;

// Defines the mouse movement
var axisVertical = new THREE.Vector3(0, 1, 0);

const element = document.querySelector("#Tag3DScene");


// ************************** //
// Pointer lock
// ************************** //
// Adapted from
// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
element.requestPointerLock = element.requestPointerLock ||
			     element.mozRequestPointerLock ||
			     element.webkitRequestPointerLock;

// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock ||
			   document.mozExitPointerLock ||
			   document.webkitExitPointerLock;

//  1. Initialize an empty scene
//  2. Load all sounds to memory
//  3. Animate
helper.initEmptyScene(sceneElements);
loadSounds();
requestAnimationFrame(computeFrame);

// ************************** //
// Event Listeners
// ************************** //
window.addEventListener('resize', resizeWindow);

document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
document.addEventListener('keypress', onDocumentKeyClick, false);
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", handleMouseMove, false);
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
        case 37: // left arrow
            arrowLeft = true;
            break;
        case 39: // right arrow
            arrowRight = true;
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
        case 37: // left arrow
            arrowLeft = false;
            break;
        case 39: // right arrow
            arrowRight = false;
            break;
    }
}
function onDocumentKeyClick(event){
    switch (event.keyCode) {
        case 112: //p
            pauseGame();
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

function loadLevel(levelName){

    gameIsReady = false;
    levelMapName = levelName;
    
    clearGame();
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
                    const pointHitbox = new THREE.Sphere(point.position, 0.25);
                    pointHitbox.name = point.name + "_hitbox";
                    pointHitboxes.push(pointHitbox);
                    break;
                case "o":
                    // Power Up
                    const powerUp = new models.createPowerUp(powerUpN);
                    powerUpN++;
                    powerUp.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    sceneElements.sceneGraph.add(powerUp);
                    // Hitbox
                    const powerUpHitbox = new THREE.Sphere(powerUp.position, 0.25);
                    powerUpHitbox.name = powerUp.name + "_hitbox";
                    powerUpHitboxes.push(powerUpHitbox);
                    lightSources.push({light: powerUp, position: powerUp.position});
                    break;
                case "P":
                    // Pacman Spawn
                    pacmanSpawnPoint.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    break;
                case "G":
                    // Ghost Spawn
                    ghostSpawnPoint.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    break;
                case "F":
                    // Fruit
                    fruitLocations.push(new THREE.Vector3(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 1.5, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2));
                    break;
                default:
                    // Portal
                    portals.push({num: level[line][char], coordX: char, coordZ: line});
                    const portal = models.createPortal(portalsN, BLOCK_SIZE);
                    portalsN++;
                    portal.position.set(levelWidthCoord - char*BLOCK_SIZE - BLOCK_SIZE/2, 2, levelHeightCoord - line*BLOCK_SIZE - BLOCK_SIZE/2);
                    sceneElements.sceneGraph.add(portal);
                    lightSources.push({light: portal, position: portal.position});
                    break;
            }
        }
    }
    // ************************** //
    // Minimap Camera
    // ************************** //
    sceneElements.miniCamera = new THREE.OrthographicCamera(- levelWidthCoord / 2, levelWidthCoord / 2, levelHeightCoord / 2, - levelHeightCoord / 2, 1, 20 );
    sceneElements.miniCamera.position.set(levelWidthCoord / 2, 10, levelHeightCoord / 2);
    sceneElements.miniCamera.lookAt(levelWidthCoord / 2, 0, levelHeightCoord / 2);
    sceneElements.miniCamera.rotation.z += Math.PI;
    sceneElements.miniCamera.mapAspectRatio = levelWidthCoord/levelHeightCoord;
    // ************************** //
    // Create Pacman
    // ************************** //
    const pacman = models.createPacman(sceneElements.camera);
    pacman.position.copy(pacmanSpawnPoint);
    pacman.rotation.y += Math.PI/2;
    pacman.MOV_SPEED_X *= (1 + levelN * GHOST_SPEED_MODIFIER);
    pacman.MOV_SPEED_Z *= (1 + levelN * GHOST_SPEED_MODIFIER);
    sceneElements.sceneGraph.add(pacman);

    pacman.add(sceneElements.camera);
    // Hitbox

    pacmanHitbox.set(pacman.position, pacman.RADIUS);

    // ************************** //
    // Create Ghosts
    // ************************** //
    GHOST_PROPERTIES.forEach(g => {
        const ghost = models.createGhost(ghostN, g.primary, g.secondary);
        ghost.MOV_SPEED_X *= g.speed * (1 + levelN * GHOST_SPEED_MODIFIER);
        ghost.MOV_SPEED_Z *= g.speed * (1 + levelN * GHOST_SPEED_MODIFIER);
        ghostN++;
        sceneElements.sceneGraph.add(ghost);
        
        //ghost.position.copy(pacmanSpawnPoint);

        ghost.position.copy(ghostSpawnPoint);
        ghost.translateX(0.2);

        ghost.currentBlock = getCoords(ghost.position.x, ghost.position.z);
        //ghost.rotateY(-Math.PI/2);

        ghost.PATH_FINDING = g.path;
        ghosts.push(ghost);

        // Hitbox
        const ghostHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        ghostHitbox.name = ghost.name + "_hitbox";
        ghostHitbox.setFromObject(ghost);
        ghostHitboxes.push(ghostHitbox);

    });

    // Set some control variables

    totalPortals = portalsN;

    nextFruitSpawn = Date.now() + FRUIT_SPAWN_INTERVAL;

    poweredUp = false;
    ghostKills = 0;
    points = 0;
    isAlive = true;
    document.getElementById("start-menu").style.visibility = "visible";
    document.getElementById("start-menu-difficulty").innerHTML = "Difficulty: " + levelN;

    lives = 3;

    gameTimer = 0;
    gameIsReady = true;
    gameIsOver = false;
    gamePaused = true;
}



// Adapted from how Unity Engine works for a third person camera
function handleMouseMove(e) {
    e.preventDefault();

    var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;

    if(gamePaused)
      return;
      
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    if(mouseRotation)
        pacman.rotateOnAxis(axisVertical, -movementX * sensitivityX);
}

// Call vital game functions and update HUD
function computeFrame(time) {
    delta = (time - lastTime) / 1000;
    lastTime = time;

    if(!isAlive && !gameIsOver){
        document.getElementById("dead-timer").innerHTML = "Respawning in " + (Math.floor((deathTimer - Date.now())/1000) + 1) + "..."  ;
        if(deathTimer < Date.now())
            respawn();
    }

    if(gameIsReady && !gamePaused && !document.hasFocus()){
        pauseGame();
    }

    if(gamePaused && powerUpLimit >= Date.now())
        powerUpLimit += delta * 1000;
    if(gamePaused && nextFruitSpawn >= Date.now())
        nextFruitSpawn += delta * 1000;

    if(gameIsReady && !gamePaused && isAlive){
        gameTimer += delta;
        movePacman();
        checkPacmanBounds();
        checkLights();
        moveGhosts();
        checkCollisions();
        
        checkPowerUp();
        checkFruitSpawn();

        animatePacman();
        animateGhosts();
        animatePortals();
        animateFruits();

        if(dynamicCamera)
            moveCamera();
        document.getElementById("timer").innerHTML = "Time: " + Math.floor(gameTimer);
    }

    // Rendering
    helper.render(sceneElements);

    // Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}
