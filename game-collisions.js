// ************************** //
// Colisions and Bounds
// ************************** //

// This module requires game.js

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
                        console.log(ghostName + " hit Pacman");
                        killPacman();                  
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