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
const pacmanHitbox = new THREE.Sphere();
//const pacmanHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
//pacmanHitbox.name = "pacman_hitbox";
//pacmanHitbox.setFromObject(ghost);

// Game control properties
var gameIsReady = false;
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
var portalsN = 0;

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
const POWERUP_DURATION = 30 * 1000;
//const POWERUP_SPEED = 1.5;
const POWERUP_SPEED = 2.5;
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
var gameOver = false;
var DEATH_TIMER = 5000;
var deathTimer = 0;


// Functions are called
//  1. Initialize the level
//  2. Animate

loadLevel("level_1");
//load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);


document.getElementById("start-game").onclick = startGame;
document.getElementById("continue-game").onclick = continueGame;
document.getElementById("leave-game").onclick = leaveGame;
document.getElementById("leave-game-2").onclick = leaveGame;
//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false;
var mouseDown = false, mouseUp = true;
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
document.addEventListener('keypress', onDocumentKeyClick, false);
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
    helper.initEmptyScene(sceneElements);

    levelMapName = levelName;
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
    //pacmanHitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //pacmanHitbox.setFromObject(pacman);

    pacmanHitbox.set(pacman.position, pacman.RADIUS);
    
    
    //pacman.rotation.x = -Math.PI/2;
    

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

    poweredUp = false;
    ghostKills = 0;
    points = 0;
    isAlive = true;
    document.getElementById("start-menu").style.visibility = "visible";
    document.getElementById("start-menu-difficulty").innerHTML = "Difficulty: " + levelN;

    lives = 3;
    //levelN++;

    gameTimer = 0;
    gameIsReady = true;
    gamePaused = true;
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

    var deltaX = e.clientX - mouseX;
    mouseX = e.clientX;
    
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    /*
    if(mouseDown){
        var deltaY = e.clientY - mouseY;
        mouseY = e.clientY;
        pacman.rotateOnAxis(axis, deltaY * sensitivityX);
    }
    */
    if(gamePaused)
        return;
    // Get the difference between the previous coordinates
    
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

    if(!isAlive){
        document.getElementById("dead-timer").innerHTML = "Respawning in " + (Math.floor((deathTimer - Date.now())/1000) + 1) + "..."  ;
        if(deathTimer < Date.now())
            respawn();
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

        //moveCamera();
        document.getElementById("timer").innerHTML = "Time: " + Math.floor(gameTimer);
        
    }

    // Rendering
    helper.render(sceneElements);

    // Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

function respawn(){

    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
    isAlive = true;
    gamePaused = false;

    pacman.position.copy(pacmanSpawnPoint);

    document.getElementById("dead-menu").style.visibility = "hidden";

}
function checkCollisions(){

    // Update Pacman's Hitbox
    const pacmanModel = sceneElements.sceneGraph.getObjectByName("pacman");

    pacmanHitbox.center = pacmanModel.position;

    // Update ghost hitboxes and check collision
    ghostHitboxes.forEach((ghostHitbox) => {
        const ghostName = ghostHitbox.name.substring(0, ghostHitbox.name.length - 7);
        const ghost = sceneElements.sceneGraph.getObjectByName(ghostName);
        const ghostBody = sceneElements.sceneGraph.getObjectByName(ghostName + "_body");
        ghostHitbox.copy(ghostBody.geometry.boundingBox).applyMatrix4(ghostBody.matrixWorld);
        if(pacmanHitbox.intersectsBox(ghostHitbox)){
            if(!ghost.isDead){
                if(ghost.isScared){
                    // Increase score
                    ghostKills++;
                    addPoints(ghostKills*200);
                    // Ghost died
                    ghost.setDead();
                    // Create Path to spawn point
                    const mapCoords = getCoords(ghost.position.x, ghost.position.z);
                    const blockCenter = getBlockCenter(mapCoords.x, mapCoords.z);
                    ghost.position.x = blockCenter.x;
                    ghost.position.z = blockCenter.z;
                    ghost.path = [];
                }else{
                    if(isAlive){
                        
                        // Pacman died
                        isAlive = false;
                        lives --;
                        console.log(ghostName + " hit Pacman");
                        console.log("Lives: " + lives);
                        ghosts.forEach((ghost) => {
                            ghost.position.copy(ghostSpawnPoint);
                        });

                        gamePaused = true;
                        if( lives <= 0){
                            gameOver = true;

                        }
                        document.getElementById("dead-menu").style.visibility = "visible";
                        document.getElementById("lives").innerHTML = "Lives: " + lives;
                        if(lives == 0)
                            document.getElementById("lives").style.color = "red";
                        deathTimer = Date.now() + DEATH_TIMER;
                        
                    }
                }
            }
        }
    });

    var i = 0;
    // Check for collision with points
    for(i = 0; i < pointHitboxes.length; i++){
        if(pacmanHitbox.intersectsSphere(pointHitboxes[i])){
            const pointName = pointHitboxes[i].name.substring(0, pointHitboxes[i].name.length - 7);
            const point = sceneElements.sceneGraph.getObjectByName(pointName);
            sceneElements.sceneGraph.remove(point);
            pointHitboxes.splice(i,1);
            addPoints(10);
            return;
        }
    }
    // Check for collision with power ups
    for(i = 0; i < powerUpHitboxes.length; i++){
        if(pacmanHitbox.intersectsSphere(powerUpHitboxes[i])){
            const powerUpName = powerUpHitboxes[i].name.substring(0, powerUpHitboxes[i].name.length - 7);
            const powerUp = sceneElements.sceneGraph.getObjectByName(powerUpName);
            powerUp.turnLightOff();
            sceneElements.sceneGraph.remove(powerUp);
            powerUpHitboxes.splice(i,1);
            // Remove power up from light sources
            for(var k = 0; k < lightSources.length; k++){
                if(lightSources[k].light.name == powerUpName){
                    lightSources.splice(k,1);
                    break;
                }
            }
            addPoints(50);
            activatePowerUp();
            return;
        }
    }
}

function checkLights(){
    if(Date.now() < nextLightCheck)
        return; 
    
    nextLightCheck = Date.now() + LIGHT_CHECK_DELAY;

    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");

    // Find closest element with a light source
    var minDistance = Number.MAX_VALUE;
    var distance;
    var closestLight;

    lightSources.forEach((source) => {
        distance = pacman.position.distanceTo(source.light.position);
        if(distance < minDistance){
            closestLight = source;
            minDistance = distance;
        }
    });

    // If the closest light is still the same then don't do anything
    if(closestLightName == closestLight.light.name)
        return;
    closestLightName = closestLight.light.name;

    // Turn off all lights
    lightSources.forEach((source) => {
        source.light.turnLightOff();
    });
    // Turn on closest light
    closestLight.light.turnLightOn();

    // All lights are turned off to guarantee that there are a maximum of 3 lights on at time
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
        ghost.setScared();
        const mapCoords = getCoords(ghost.position.x, ghost.position.z);
        const blockCenter = getBlockCenter(mapCoords.x, mapCoords.z);
        ghost.position.x = blockCenter.x;
        ghost.position.z = blockCenter.z;
        ghost.path = [];
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
            if(ghost.isScared)
                ghost.setNotScared();
            const mapCoords = getCoords(ghost.position.x, ghost.position.z);
            const path = getBlockCenter(mapCoords.x, mapCoords.z)
            ghost.path = [path];
        })
        return;
    }
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

function checkWalls(){
    // Check if Pacman is next to a wall 
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

function checkWallBounds(delta){
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

function checkPacmanBounds(){
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");

    // Check if Pacman is out of bounds
    // This happens when the window loses focus and after refreshing
    if( pacman.position.x < 0 || pacman.position.x > levelWidthCoord
        || pacman.position.z < 0 || pacman.position.z > levelHeightCoord){
            // Set position to spawn
            pacman.position.copy(pacman.lastPosition);
            return;
    }
    pacman.lastPosition.copy(pacman.position);
    if(Date.now() < portalCooldown)
        return;
    // Check if block is a portal
    const block = getBlock(pacman.position.x, pacman.position.z);
    const pacmanBlock = getCoords(pacman.position.x, pacman.position.z);
    if(block != " " && !isNaN(block)){
        portals.forEach((portal) => {
            if(portal.num.toString() == block
            && portal.coordX != pacmanBlock.x 
            && portal.coordX != pacmanBlock.z){
                const portalCoords = getBlockCenter(portal.coordX, portal.coordZ);
                pacman.position.x = portalCoords.x;
                pacman.position.z = portalCoords.z;
                portalCooldown = Date.now() + PORTAL_COOLDOWN;
            }
        })
    }
}

// ************************** //
// Coordinates / Blocks
// ************************** //

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

const directions = [
    {name: "_down",  x: 0,    z: -1},
    {name: "_up",    x: 0,    z: 1},
    {name: "_left",  x: 1,    z: 0},
    {name: "_right", x: -1,   z: 0}
];
function animatePortals(){
    
    for(var i = 0; i < portalsN; i++){
        directions.forEach((dir) => {
            const portalOuterRing = sceneElements.sceneGraph.getObjectByName("portal_" + i + dir.name + "_ring_1");
            const portalThirdRing = sceneElements.sceneGraph.getObjectByName("portal_" + i + dir.name + "_ring_2");
            const portalQuarterRing = sceneElements.sceneGraph.getObjectByName("portal_" + i + dir.name + "_ring_3");
            const portalSexthRing = sceneElements.sceneGraph.getObjectByName("portal_" + i + dir.name + "_ring_4");
            
            portalOuterRing.position.z += portalOuterRing.BOB_SPEED * dir.z * delta;
            portalOuterRing.position.x += portalOuterRing.BOB_SPEED * dir.x * delta;
            portalOuterRing.rotation.z += portalOuterRing.ROTATION_SPEED * dir.z * delta;
            portalOuterRing.rotation.x += portalOuterRing.ROTATION_SPEED * dir.x * delta;
            if(dir.z != 0){
                if(dir.z*portalOuterRing.position.z < BLOCK_SIZE/2 + 1/100 ){
                    portalOuterRing.BOB_SPEED *= -1;
                    portalOuterRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z/100;
                }
                else if(dir.z*portalOuterRing.position.z > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalOuterRing.BOB_SPEED *= -1;
                    portalOuterRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z*portalOuterRing.BOB_MAX_DISTANCE - dir.z/100;
                }
            }else{
                if(dir.x*portalOuterRing.position.x < BLOCK_SIZE/2 + 1/100 ){
                    portalOuterRing.BOB_SPEED *= -1;
                    portalOuterRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x/100;
                }
                else if(dir.x*portalOuterRing.position.x > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalOuterRing.BOB_SPEED *= -1;
                    portalOuterRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x*portalOuterRing.BOB_MAX_DISTANCE - dir.x/100;
                }
            }
            portalThirdRing.position.z += portalThirdRing.BOB_SPEED * dir.z * delta;
            portalThirdRing.position.x += portalThirdRing.BOB_SPEED * dir.x * delta;
            portalThirdRing.rotation.z += portalThirdRing.ROTATION_SPEED * dir.z * delta;
            portalThirdRing.rotation.x += portalThirdRing.ROTATION_SPEED * dir.x * delta;
            if(dir.z != 0){
                if(dir.z*portalThirdRing.position.z < BLOCK_SIZE/2 + 1/100 ){
                    portalThirdRing.BOB_SPEED *= -1;
                    portalThirdRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z/100;
                }
                else if(dir.z*portalThirdRing.position.z > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalThirdRing.BOB_SPEED *= -1;
                    portalThirdRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z*portalOuterRing.BOB_MAX_DISTANCE - dir.z/100;
                }
            }else{
                if(dir.x*portalThirdRing.position.x < BLOCK_SIZE/2 + 1/100 ){
                    portalThirdRing.BOB_SPEED *= -1;
                    portalThirdRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x/100;
                }
                else if(dir.x*portalThirdRing.position.x > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalThirdRing.BOB_SPEED *= -1;
                    portalThirdRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x*portalOuterRing.BOB_MAX_DISTANCE - dir.x/100;
                }
            }
            portalQuarterRing.position.z += portalQuarterRing.BOB_SPEED * dir.z * delta;
            portalQuarterRing.position.x += portalQuarterRing.BOB_SPEED * dir.x * delta;
            portalQuarterRing.rotation.z += portalQuarterRing.ROTATION_SPEED * dir.z * delta;
            portalQuarterRing.rotation.x += portalQuarterRing.ROTATION_SPEED * dir.x * delta; 
            if(dir.z != 0){
                if(dir.z*portalQuarterRing.position.z < BLOCK_SIZE/2 + 1/100 ){
                    portalQuarterRing.BOB_SPEED *= -1;
                    portalQuarterRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z/100;
                }
                else if(dir.z*portalQuarterRing.position.z > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalQuarterRing.BOB_SPEED *= -1;
                    portalQuarterRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z*portalOuterRing.BOB_MAX_DISTANCE - dir.z/100;
                }
            }else{
                if(dir.x*portalQuarterRing.position.x < BLOCK_SIZE/2 + 1/100 ){
                    portalQuarterRing.BOB_SPEED *= -1;
                    portalQuarterRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x/100;
                }
                else if(dir.x*portalQuarterRing.position.x > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalQuarterRing.BOB_SPEED *= -1;
                    portalQuarterRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x*portalOuterRing.BOB_MAX_DISTANCE - dir.x/100;
                }
            }
            portalSexthRing.position.z += portalSexthRing.BOB_SPEED * dir.z * delta;
            portalSexthRing.position.x += portalSexthRing.BOB_SPEED * dir.x * delta;
            portalSexthRing.rotation.z += portalSexthRing.ROTATION_SPEED * dir.z * delta;
            portalSexthRing.rotation.x += portalSexthRing.ROTATION_SPEED * dir.x * delta;
            if(dir.z != 0){
                if(dir.z*portalSexthRing.position.z < BLOCK_SIZE/2 + 1/100 ){
                    portalSexthRing.BOB_SPEED *= -1;
                    portalSexthRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z/100;
                }
                else if(dir.z*portalSexthRing.position.z > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalSexthRing.BOB_SPEED *= -1;
                    portalSexthRing.position.z = dir.z*BLOCK_SIZE/2 + dir.z*portalOuterRing.BOB_MAX_DISTANCE - dir.z/100;
                }
            }else{
                if(dir.x*portalSexthRing.position.x < BLOCK_SIZE/2 + 1/100 ){
                    portalSexthRing.BOB_SPEED *= -1;
                    portalSexthRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x/100;
                }
                else if(dir.x*portalSexthRing.position.x > BLOCK_SIZE/2 + portalOuterRing.BOB_MAX_DISTANCE){
                    portalSexthRing.BOB_SPEED *= -1;
                    portalSexthRing.position.x = dir.x*BLOCK_SIZE/2 + dir.x*portalOuterRing.BOB_MAX_DISTANCE - dir.x/100;
                }
            }
        });

    }
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
    checkWallBounds(delta);
}

function moveGhosts(){
    ghosts.forEach((ghost) => {
        
        // Check if ghost is out of bounds
        // This happens when the window loses focus and after refreshing
        if( ghost.position.x < 0 || ghost.position.x > levelWidthCoord
        || ghost.position.z < 0 || ghost.position.z > levelHeightCoord
        || getBlock(ghost.position.x, ghost.position.z) == "#" 
        || getBlock(ghost.position.x, ghost.position.z) == "#"){
            // Clear path
            ghost.path = []
            // Set position to supposed current block
            const newPos = getBlockCenter(ghost.currentBlock.x, ghost.currentBlock.z);
            ghost.position.x = newPos.x;
            ghost.position.z = newPos.z;
        }
        
        if(ghost.path.length > 0){
            const currBlock = getCoords(ghost.position.x, ghost.position.z);
            var nextPath = ghost.path[0];
            ghost.currentBlock = currBlock;
            
            // Check if ghost is in the middle of the target path block
            if(ghost.position.x > nextPath.x - POSITION_ERROR 
                && ghost.position.x < nextPath.x + POSITION_ERROR
                && ghost.position.z > nextPath.z - POSITION_ERROR 
                && ghost.position.z < nextPath.z + POSITION_ERROR){
                
                ghost.path.shift();

                // Check for direction in the new path, if there's one
                if(ghost.path.length > 0){
                    nextPath = ghost.path[0];
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
            if(ghost.isDead){
                // Check if ghost is on its respawn block
                const currBlock = getBlock(ghost.position.x, ghost.position.z);
                if(currBlock == "G")
                    ghost.setAlive();   
                else{
                    ghost.path = getShortestPathTo(ghost.position.x, ghost.position.z, ghostSpawnPoint.x, ghostSpawnPoint.z);
                    return;
                }
            }
            if(ghost.isScared){
                const path = getPathToCorner(ghost.position.x, ghost.position.z);
                ghost.path = path;
            }
            else{
                if(ghost.PATH_FINDING == "SHORTEST"){
                    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
                    const path = getShortestPathTo(ghost.position.x, ghost.position.z, pacman.position.x, pacman.position.z);
                    ghost.path = path;
                }else if(ghost.PATH_FINDING == "RANDOM"){
                    const path = getRandomPath(ghost.position.x, ghost.position.z);
                    ghost.path = path;
                }
            }
        }
    });
}

function moveCamera(){
    // Adapted from
    // https://sbcode.net/threejs/raycaster2/
    const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
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
}

// ************************** //
// Path Finding
// ************************** //


function findAdjacentBlocks(x, z){
    const options = [];
    // Check adjacent nodes
    if(x > 0 && level[z][x-1] != "#")
        options.push({x: -1, z: 0, name: "LEFT"});
    if(x + 1 < levelWidth && level[z][x+1] != "#")
        options.push({x: 1, z: 0, name: "RIGHT"});
    if(z > 0 && level[z-1][x] != "#")
        options.push({x: 0, z: -1, name: "DOWN"});
    if(z + 1 < levelHeight && level[z+1][x] != "#")
        options.push({x: 0, z: 1, name: "UP"});

    return options;
}

function getRandomPath(x, z){

    const ghostPos = getCoords(x, z);
    const options = findAdjacentBlocks(ghostPos.x, ghostPos.z);
    const choice = options[Math.floor(Math.random() * options.length)];
    const coords = {x: ghostPos.x + choice.x, z: ghostPos.z + choice.z};
    const path = [ {x: ghostPos.x, z: ghostPos.z}, {x: coords.x, z: coords.z}];
    var findingPath = true;

    // Find a path until next wall
    while(findingPath){
        if(
            coords.x + choice.x >= 0 && coords.x + choice.x < levelWidth && 
            coords.z + choice.z >= 0 && coords.z + choice.z < levelHeight &&
            level[coords.z + choice.z][coords.x + choice.x] != "#"
        ){
            coords.x += choice.x;
            coords.z += choice.z;
            path.push({x: coords.x, z: coords.z});
        }else{
            findingPath = false;
        }
    }

    const pathCoords = [];
    pathCoords.push(getBlockCenter(path[0].x, path[0].z));
    // Shorten the path to the next intersection
    for(var i = 1; i < path.length; i++){
        const adjacentBlocks = findAdjacentBlocks(path[i].x, path[i].z);
        pathCoords.push(getBlockCenter(path[i].x, path[i].z));
        if(adjacentBlocks.length > 2){
            break
        }
    }
    return pathCoords;
}

function getMapCopy(){
    var map = [];
    var line = [];
    for(var i = 0; i < level.length; i++){
        line = [];
        for(var k = 0; k < level[0].length; k++){
            line.push(level[i][k]);
        }
        map.push(line);
    }
    return map;
}

function getShortestPathTo(x, z, destX, destZ){
    // Adapted from
    // https://medium.com/@manpreetsingh.16.11.87/shortest-path-in-a-2d-array-java-653921063884
    
    // Copy the map to a new variable (Shallow copy)
    var map = getMapCopy();

    // Get position in the map
    const destPos = getCoords(destX, destZ);
    const ghostPos = getCoords(x, z);

    if(ghostPos.x == destPos.x && ghostPos.z == destPos.z){
        return [getBlockCenter(ghostPos.x,ghostPos.z)];
    }

    // Create a queue with nodes
    const sourceNode = {x: ghostPos.x, z: ghostPos.z, previous: null};
    const queue = [sourceNode];
    var popedNode, tries = 0;
    
    //console.log("Finding path from [" + x + ", " + z + "] to [" + destX + ", " + destZ + "]")
    while(queue.length > 0){
        tries++;
        popedNode = queue.shift();

        // Check if this Node represents the block pacman is in
        if(popedNode.x == destPos.x && popedNode.z == destPos.z){
            console.log("Found a path to [" + destX + ", " + destZ + "] after searching " + tries + " blocks.");
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

    console.log("Couldn't find a path from [" + x + ", " + z + "] to [" + destX + ", " + destZ + "] after searching " + tries + " blocks.");
    return [];
}

function getPathToCorner(x, z){
    // Finds shortest path to the closest corner

    var quarter = "";
    // Find which quarter of the map it is
    if(z > levelHeightCoord / 2)
        quarter += "TOP";
    else    
        quarter += "BOTTOM";
    if(x > levelWidthCoord / 2)
        quarter += "_LEFT";
    else    
        quarter += "_RIGHT";    

    var block;
    switch(quarter){
        case "TOP_RIGHT":
            block = getClosestBlockTo(0, levelHeight-1);
            break;
        case "TOP_LEFT":
            block = getClosestBlockTo(0, 0);
            break;
        case "BOTTOM_RIGHT":
            block = getClosestBlockTo(levelWidth-1,levelHeight-1);
            break;
        case "BOTTOM_LEFT":
            block = getClosestBlockTo(levelWidth-1,0);
            break;
    }

    block = getBlockCenter(block.x, block.z);

    return getShortestPathTo(x, z, block.x, block.z);
}

function getClosestBlockTo(x, z){
    // returns the closest walkable block to the coordinates
    var map = getMapCopy();

    if(map[z][x] != "#" && map[z][x] != "-")
        return({x: x, z: z});

    // Create a queue with nodes
    const sourceNode = {x: x, z: z, previous: null};
    const queue = [sourceNode];
    var popedNode;
    
    while(queue.length > 0){
        popedNode = queue.shift();

        if(popedNode.x < 0 || popedNode.x >= levelWidth || popedNode.z < 0 || popedNode.z >= levelHeight)
            continue;
        if(map[popedNode.z][popedNode.x] != "#" && map[popedNode.z][popedNode.x] != "-" && map[popedNode.z][popedNode.x] != "X"){
            return({x: popedNode.x, z: popedNode.z});
        }

        // Mark as a walked to not repeat blocks
        map[popedNode.z][popedNode.x] = "X";
        // TopLeft, TopRight, BottomLeft, BottomRight
        if(popedNode.x > 0 && popedNode.z > 0 
            && map[popedNode.z-1][popedNode.x-1] != "X")
            queue.push({x: popedNode.x-1, z: popedNode.z-1, previous: popedNode});

        if(popedNode.x + 1 < levelWidth && popedNode.z > 0 
            && map[popedNode.z-1][popedNode.x+1] != "X")
            queue.push({x: popedNode.x+1, z: popedNode.z, previous: popedNode});

        if(popedNode.z + 1 < levelHeight && popedNode.x > 0
            && map[popedNode.z+1][popedNode.x-1] != "X")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});

        if(popedNode.z + 1 < levelHeight && popedNode.x + 1 < levelWidth
            && map[popedNode.z+1][popedNode.x+1] != "X")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});
        // Left, Right, Up, Down
        if(popedNode.x > 0 && map[popedNode.z][popedNode.x-1] != "X")
            queue.push({x: popedNode.x-1, z: popedNode.z, previous: popedNode});

        if(popedNode.x + 1 < levelWidth && map[popedNode.z][popedNode.x+1] != "X")
            queue.push({x: popedNode.x+1, z: popedNode.z, previous: popedNode});

        if(popedNode.z > 0 && map[popedNode.z-1][popedNode.x] != "X")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});

        if(popedNode.z + 1 < levelHeight && map[popedNode.z+1][popedNode.x] != "X")
            queue.push({x: popedNode.x, z: popedNode.z+1, previous: popedNode});

    }

    console.log("Couldn't find a walkable block");
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

function lerp (start, end, amount){
    // Taken from https://codepen.io/ma77os/pen/OJPVrP
    return (1-amount) * start + amount * end;
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
}

function pauseGame(){
    if(!isAlive)
        return;
    console.log("Pausing game");
    gamePaused = true;
    document.getElementById("pause-menu").style.visibility = "visible";
}

function restartGame(){
    // Implement
    // Implement
    // Implement
    console.log("Restarting game");
}

function continueGame(){
    console.log("Unpausing game");
    gamePaused = false;
    document.getElementById("pause-menu").style.visibility = "hidden";
}

function leaveGame(){
    // Implement
    // Implement
    // Implement
    console.log("Leaving game");
}