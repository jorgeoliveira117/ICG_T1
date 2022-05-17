// ************************** //
// Game Events
// ************************** //

// This module requires game.js

function checkPowerUp(){
    if(!poweredUp)
        return;

    if(Date.now() > powerUpLimit){
        poweredUp = false;

        // Decrease Pacman's speed
        const pacman = sceneElements.sceneGraph.getObjectByName("pacman");
        pacman.MOV_SPEED_X /= POWERUP_SPEED;
        pacman.MOV_SPEED_Z /= POWERUP_SPEED;

        // Reset Lights
        sceneElements.renderer.setClearColor('rgb(0, 150, 255)', 0.4);
        const ambientLight = sceneElements.sceneGraph.getObjectByName("ambientLight");
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
    animateAmbientLight();
    animateRendererColor();
}

function checkWinCondition(){
    if(pointHitboxes.length == 0 && powerUpHitboxes.length == 0){
        gameWon();
        return true;
    }else
        return false;
}

function checkFruitSpawn(){
    if(Date.now() < nextFruitSpawn)
        return;

    // Spawn a fruit
    if(fruits.length == 3)
        return;
    console.log("Spawning fruit");
    // Find a spawn location
    for(var i = 0; i < fruitLocations.length; i++){
        if(fruits.find((f) => 
            f.position.x == fruitLocations[i].x && 
            f.position.z == fruitLocations[i].z) == null){
            const fruit = models.createFruit();
            fruit.position.copy(fruitLocations[i]);
            sceneElements.sceneGraph.add(fruit);
            fruits.push(fruit);
            // Hitbox
            const fruitHitbox = new THREE.Sphere(fruit.position, 0.25);
            fruitHitboxes.push(fruitHitbox);
            playFruitSpawnSound();
            break;
        }
    }    
    nextFruitSpawn = Date.now() + FRUIT_SPAWN_INTERVAL;
}

function killPacman(){
    playPacmanDeadSound();
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
        if(ghost.isDead)
            ghost.setAlive(); 
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
    playRespawnSound();
    document.getElementById("dead-menu").style.visibility = "hidden";
}

function killGhost(ghost){
    playGhostDeadSound();
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
}

function gameOver(){
    playGameLostSound();
    document.exitPointerLock();
    gameIsOver = true;
    document.getElementById("game-over").style.visibility = "visible";
    document.getElementById("game-over-points").innerHTML = "You finished with " + points + " points!";
}

function gameWon(){
    playGameWonSound();
    document.exitPointerLock();
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
    fruitHitboxes = [];
    fruitLocations = [];
    fruits = [];
    document.getElementById("win-menu").style.visibility = "hidden";
    document.getElementById("game-over").style.visibility = "hidden";
    document.getElementById("score").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
    document.getElementById("lives").innerHTML = "";
}