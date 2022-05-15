// ************************** //
// Movements
// ************************** //

// This module requires game.js

const verticalAxis = new THREE.Vector3(0, 1, 0);

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

    if (arrowLeft && !wallCollision.back)
        pacman.rotateOnAxis(verticalAxis, delta * pacman.ROTATION_SPEED);
    if (arrowRight && !wallCollision.back)
        pacman.rotateOnAxis(verticalAxis, - delta * pacman.ROTATION_SPEED);

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