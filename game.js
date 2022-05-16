"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
    miniCamera: null
};

// Hitboxes in the game
var wallMeshes = []; 
var portals = [];
var ghostHitboxes = [];
var pointHitboxes = [];
var powerUpHitboxes = [];
const pacmanHitbox = new THREE.Sphere();
//const pacmanHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
//pacmanHitbox.name = "pacman_hitbox";
//pacmanHitbox.setFromObject(ghost);

// Game control properties
var gameIsReady = false;
var gameIsOver = false;
const ghosts = [];
const GHOST_PROPERTIES = [
    {primary: 0xF80404, secondary: 0xA30404, speed: 1.1},
    {primary: 0xF8ACF4, secondary: 0xA3ACF4, speed: 1.0},
    {primary: 0x08F8F4, secondary: 0x059997, speed: 0.95},
    {primary: 0xFF8E00, secondary: 0xA65D02, speed: 0.9}
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
var totalPortals = 0;

const lightSources = [];
const LIGHT_CHECK_DELAY = 200;
var nextLightCheck = 0;
var closestLightName = "";

// Movement properties
const MOVE_UP = { movement: "UP", xBias: 0, zBias: 1, rotationAngle: 0};
const MOVE_DOWN = { movement: "DOWN", xBias: 0, zBias: -1, rotationAngle: -Math.PI};
const MOVE_LEFT = { movement: "LEFT", xBias: 1, zBias: 0, rotationAngle: Math.PI / 2};
const MOVE_RIGHT = { movement: "RIGHT", xBias: -1, zBias: 0, rotationAngle: -Math.PI / 2};
const MOVE_DIRECTIONS = [MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT];

const ROTATION_ERROR = Math.PI/100;
const POSITION_ERROR = 0.1;

// Game values
const PACMAN_SPEED_MODIFIER = 0.1;
const GHOST_SPEED_MODIFIER = 0.1;

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

var dynamicCamera = true;
var mouseRotation = true;


// Functions are called
//  1. Initialize the level
//  2. Animate
helper.initEmptyScene(sceneElements);
//load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);


document.getElementById("start-game").onclick = startGame;
document.getElementById("continue-game").onclick = continueGame;
document.getElementById("restart-game").onclick = restartGame;
document.getElementById("next-game").onclick = nextLevel;
document.getElementById("leave-game").onclick = leaveGame;
document.getElementById("leave-game-2").onclick = leaveGame;
document.getElementById("leave-game-3").onclick = leaveGame;
document.getElementById("leave-game-4").onclick = leaveGame;


document.getElementById("load-level").onclick = loadGameLevel;

document.getElementById('dynamic-camera').addEventListener('change', (event) => {
  toggleDynamicCamera(event);
})
document.getElementById('mouse-rotation').addEventListener('change', (event) => {
  toggleMouseRotation(event);
})
//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false, arrowLeft = false, arrowRight;
var mouseDown = false, mouseUp = true;

const element = document.querySelector("#Tag3DScene");


// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
element.requestPointerLock = element.requestPointerLock ||
			     element.mozRequestPointerLock ||
			     element.webkitRequestPointerLock;


// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock ||
			   document.mozExitPointerLock ||
			   document.webkitExitPointerLock;

// Ask the browser to lock the pointer
//
//document.exitPointerLock();


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
//////////////////////////////////////////////////////////////////


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

        if(ghostN == 1)
            ghost.PATH_FINDING = "SHORTEST";
        ghosts.push(ghost);

        // Hitbox
        const ghostHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        ghostHitbox.name = ghost.name + "_hitbox";
        ghostHitbox.setFromObject(ghost);
        ghostHitboxes.push(ghostHitbox);

    });

    totalPortals = portalsN;


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


var mouseX = 0;
var mouseY = 0;
var sensitivityX = 0.005;
var axisVertical = new THREE.Vector3(0, 1, 0);
var axis = new THREE.Vector3(0, 0, 1);

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

    if(gameIsReady && !gamePaused && isAlive){
        gameTimer += delta;
        movePacman();
        checkPacmanBounds();
        checkLights();
        moveGhosts();
        checkCollisions();
        animatePacman();
        animateGhosts();
        animatePortals();
        checkPowerUp();

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

// ************************** //
// Game Events
// ************************** //

function checkPowerUp(){
    if(!poweredUp)
        return;

    const ambientLight = sceneElements.sceneGraph.getObjectByName("ambientLight");
    if(Date.now() > powerUpLimit){
        poweredUp = false;

        // Decrease Pacman's speed
        const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
        pacman.MOV_SPEED_X /= POWERUP_SPEED;
        pacman.MOV_SPEED_Z /= POWERUP_SPEED;

        // Reset Lights
        sceneElements.renderer.setClearColor('rgb(0, 150, 255)', 0.4);
        ambientLight.intensity = ambientLight.MIN_INTENSITY;

        ghosts.forEach((ghost) => {
            if(ghost.isScared && !ghost.isDead)
                ghost.setNotScared();
            const mapCoords = getCoords(ghost.position.x, ghost.position.z);
            const path = getBlockCenter(mapCoords.x, mapCoords.z)
            ghost.path = [path];
        })
        document.getElementById("powerup").innerHTML = "";
        return;
    }

    const remainingPowerUp = Math.floor((powerUpLimit - Date.now())/1000) + 1;
    if(remainingPowerUp > 1)
        document.getElementById("powerup").innerHTML = "Empowered for " + remainingPowerUp + " seconds!";
    else
        document.getElementById("powerup").innerHTML = "Empowered for " + remainingPowerUp + " second!";
    // Animate ambient light
    ambientLight.intensity += ambientLight.SPEED * delta;
    if(ambientLight.intensity >= ambientLight.MAX_INTENSITY){
        ambientLight.intensity = ambientLight.MAX_INTENSITY;
        ambientLight.SPEED *= -1;
    }else if (ambientLight.intensity <= ambientLight.MIN_INTENSITY){
        ambientLight.intensity = ambientLight.MIN_INTENSITY;
        ambientLight.SPEED *= -1;
    }
    // Animate renderer color
    sceneElements.renderer.setClearAlpha(sceneElements.renderer.getClearAlpha() + sceneElements.renderer.SPEED * delta);
    if(sceneElements.renderer.getClearAlpha() >= sceneElements.renderer.MAX_INTENSITY){
        sceneElements.renderer.setClearAlpha(sceneElements.renderer.MAX_INTENSITY);
        sceneElements.renderer.SPEED *= -1;
    }else if (sceneElements.renderer.getClearAlpha() <= sceneElements.renderer.MIN_INTENSITY){
        sceneElements.renderer.setClearAlpha(sceneElements.renderer.MIN_INTENSITY);
        sceneElements.renderer.SPEED *= -1;
    }
}

function killPacman(){
    powerUpLimit = 0;
    isAlive = false;
    gamePaused = true;
    if(lives <= 0){
        gameOver();
        return;
    }

    lives --;
    console.log("Lives: " + lives);
    ghosts.forEach((ghost) => {
        ghost.position.copy(ghostSpawnPoint);
    });

    document.getElementById("dead-menu").style.visibility = "visible";
    document.getElementById("lives").innerHTML = "Lives: " + lives;
    if(lives == 0)
        document.getElementById("lives").style.color = "red";
    deathTimer = Date.now() + DEATH_TIMER;
}

function respawn(){
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    isAlive = true;
    gamePaused = false;
    pacman.position.copy(pacmanSpawnPoint);
    document.getElementById("dead-menu").style.visibility = "hidden";
}

function killGhost(ghost){
    
}

function checkWinCondition(){
    console.log(pointHitboxes.length)
    console.log(powerUpHitboxes.length)
    if(pointHitboxes.length == 0 && powerUpHitboxes.length == 0){
        gameWon();
        return true;
    }else
        return false;

}

function gameOver(){
    document.exitPointerLock();
    gameIsOver = true;
    document.getElementById("game-over").style.visibility = "visible";
    document.getElementById("game-over-points").innerHTML = "You finished with " + points + " points!";
}

function gameWon(){
    gameIsOver = true;
    gamePaused = true;
    levelN++;
    document.getElementById("win-menu").style.visibility = "visible";
}

function nextLevel(){
    restartGame();
}

function addPoints(n){
    points += n;
    document.getElementById("score").innerHTML = "Points: " + points;
    console.log("Points: " + points);
}

function activatePowerUp(){
    sceneElements.renderer.setClearColor('rgb(100, 255, 200)', 0.4);

    // Make ghosts scared
    ghosts.forEach((ghost) => {
        if(!ghost.isDead){
            ghost.setScared();
            const mapCoords = getCoords(ghost.position.x, ghost.position.z);
            const blockCenter = getBlockCenter(mapCoords.x, mapCoords.z);
            ghost.position.x = blockCenter.x;
            ghost.position.z = blockCenter.z;
            ghost.path = [];
        }
    })

    if(poweredUp){
        powerUpLimit += POWERUP_DURATION;
        return;
    }
    poweredUp = true;
    // Increase Pacman's speed
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    pacman.MOV_SPEED_X *= POWERUP_SPEED;
    pacman.MOV_SPEED_Z *= POWERUP_SPEED;

    powerUpLimit = Date.now() + POWERUP_DURATION;
}

function clearGame(){
    // Removes models and hitboxes
    sceneElements.sceneGraph.clear();
    wallMeshes = []; 
    portals = [];
    ghostHitboxes = [];
    pointHitboxes = [];
    powerUpHitboxes = [];
    document.getElementById("win-menu").style.visibility = "hidden";
    document.getElementById("game-over").style.visibility = "hidden";
    document.getElementById("score").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
    document.getElementById("lives").innerHTML = "";
}

// ************************** //
// HUD events
// ************************** //

function startGame(){
    if(!gameIsReady)
        return;
    console.log("Starting game");
    document.getElementById("start-menu").style.visibility = "hidden";
    document.getElementById("score").innerHTML = "Points: " + points;
    document.getElementById("timer").innerHTML = "Time: " + Math.floor(gameTimer);
    document.getElementById("lives").innerHTML = "Lives: " + lives;
    document.getElementById("lives").style.color = "aliceblue";
    gamePaused = false;
    
    element.requestPointerLock();
}

function pauseGame(){
    if(!isAlive)
        return;
    console.log("Pausing game");
    document.exitPointerLock();
    gamePaused = true;
    document.getElementById("pause-menu").style.visibility = "visible";
}

function restartGame(){
    console.log("Restarting game");
    powerUpLimit = 0;
    checkPowerUp();
    loadLevel(levelMapName);
}

function continueGame(){
    console.log("Unpausing game");
    gamePaused = false;
    document.getElementById("pause-menu").style.visibility = "hidden";
    element.requestPointerLock();
}

function leaveGame(){
    console.log("Leaving game");
    powerUpLimit = 0;
    checkPowerUp();
    clearGame();
    document.getElementById("win-menu").style.visibility = "hidden";
    document.getElementById("game-over").style.visibility = "hidden";
    document.getElementById("pause-menu").style.visibility = "hidden";
    document.getElementById("score").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
    document.getElementById("lives").innerHTML = "";
    document.getElementById("main-menu").style.visibility = "visible";
    document.getElementById("side-menu").style.visibility = "visible";
}

function loadGameLevel(){
    const baseName = "map-";
    document.getElementById("main-menu").style.visibility = "hidden";
    document.getElementById("side-menu").style.visibility = "hidden";
    for(var i = 1; i <= levels.howManyLevels(); i++){
        if(document.getElementById(baseName + i).classList.contains("active")){
            loadLevel(levels.getLevelNameByNum(i));
            break;
        }
    }
    
}

function openGameModelsMenu(){
    
}

function toggleDynamicCamera(event){
    if (event.currentTarget.checked)
        dynamicCamera = true;
    else
        dynamicCamera = false;
}

function toggleMouseRotation(event){
    if (event.currentTarget.checked)
        mouseRotation = true;
    else
        mouseRotation = false;
}