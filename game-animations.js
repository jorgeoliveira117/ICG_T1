// ************************** //
// Animations
// ************************** //

// This module requires game.js

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
    
    for(var i = 0; i < totalPortals; i++){
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

