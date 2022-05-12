"use strict";

const pointMaterial = new THREE.MeshPhongMaterial({ 
    color: 'rgb(0,0,135)', 
    emissive: 'rgb(0,200,255)', 
    specular: 'rgb(255,255,255)', 
    shininess: 120 
});
const pointGeometry = new THREE.SphereGeometry( 0.25, 16, 8 );


const powerUpMaterial = new THREE.MeshPhongMaterial({ 
    color: 'rgb(255,200,0)', 
    emissive: 'rgb(255,240,75)', 
    specular: 'rgb(255,255,255)', 
    shininess: 20 
});
const powerUpGeometry = new THREE.SphereGeometry( 0.5, 32, 16 );


const wallMaterial = new THREE.MeshToonMaterial( {color: 0x1d1957} );


const ghostHeadGeometry = new THREE.SphereGeometry( 0.8, 32, 16, 0, 2*Math.PI, 0, Math.PI/2 );
const ghostBodygeometry = new THREE.CylinderGeometry( 0.8, 0.8, 1, 32 );
const ghostSkirtGeometry = new THREE.CylinderGeometry( 0.2, 0.1, 0.3, 3 );
const ghostTailSphere = new THREE.SphereGeometry(0.2, 8, 4);
const ghostEyesGeometry = new THREE.SphereGeometry( 0.2, 16, 16, 0, 2*Math.PI, 0, Math.PI-Math.PI/6);
const ghostEyeRetinaGeometry = new THREE.SphereGeometry( 0.2, 16, 16, 0, 2*Math.PI, 0, Math.PI/6);
const ghostScaredEyesGeometry = new THREE.SphereGeometry( 0.2, 16, 16);
const mouthShape = new THREE.Shape();
        mouthShape.moveTo(-0.6, -0.5);
        mouthShape.quadraticCurveTo(-0.4, -0.2 , -0.2, -0.5);
        mouthShape.quadraticCurveTo(0.0, -0.2 , 0.2, -0.5);
        mouthShape.quadraticCurveTo(0.4, -0.2 , 0.6, -0.5);
        mouthShape.lineTo(0.6, -0.6);
        mouthShape.quadraticCurveTo(0.4, -0.3 , 0.2, -0.6);
        mouthShape.quadraticCurveTo(0.0, -0.3 , -0.2, -0.6);
        mouthShape.quadraticCurveTo(-0.4, -0.3 , -0.6, -0.6);
const ghostMouthGeometry = new THREE.ShapeGeometry( mouthShape );
        
const ghostScaredEyesMaterial = new THREE.MeshBasicMaterial( { color: 0xF5F0CB, side: THREE.DoubleSide } );
const ghostScaredMaterial = new THREE.MeshPhongMaterial({ color: 0x2129FF, emissive: 0x2129FF, specular: 0x2129FF, shininess: 20 });


const models = {

    // ************************** //
    // Point
    // ************************** //
    createPoint: function(n){
        const point = new THREE.Mesh( pointGeometry, pointMaterial );
        point.name = "point_" + n;
        point.castShadow = true;
        
        return point;
    },
    // ************************** //
    // Power Up
    // ************************** //
    createPowerUp: function(n){
        const powerUp = new THREE.Mesh( powerUpGeometry, powerUpMaterial );
        powerUp.name = "powerup_" + n;
        powerUp.castShadow = true;
        const light = new THREE.PointLight( 0xFFFF00, 2, 10 );
        powerUp.add( light );

        return powerUp;
    },
    // ************************** //
    // Pacman
    // ************************** //
    createPacman: function(camera){
        const pacmanGeometry = new THREE.SphereGeometry( 1, 64, 32, 0.314, 6 );
        const pacmanMaterial = new THREE.MeshPhongMaterial({ color: 0xfce303, side: THREE.DoubleSide });
        const pacman = new THREE.Mesh( pacmanGeometry, pacmanMaterial );
        //pacmanMaterial.side = THREE.DoubleSide;
        // Name
        pacman.name = "pacmanModel";
        // Set shadow property
        pacman.castShadow = true;
        pacman.receiveShadow = false;
        // Rotation
        pacman.rotation.z = Math.PI / 2;
        pacman.rotation.x = Math.PI / 2;
        //pacman.rotation.y = Math.PI / 10;

        // Values for bobbing animation
        pacman.bobSpeed = 0.2;
        pacman.BOB_MAX_HEIGHT = 0.1;
        pacman.BOB_MIN_HEIGHT = -0.1;
        // Values for mouth animation
        pacman.mouthSpeed = 1.5;
        pacman.MOUTH_MAX_OPENED = 6;
        pacman.MOUTH_MIN_OPENED = 5;
        pacman.EYES_MAX_ROTATION = 0;
        pacman.EYES_MIN_ROTATION = -1;
        

        // Eyes
        const eyesGeometry = new THREE.SphereGeometry( 0.2, 16, 8);
        const eyesMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        const leftEye = new THREE.Mesh( eyesGeometry, eyesMaterial );
        const eyesBase = new THREE.Group();
        eyesBase.name = "pacmanEyes";
        eyesBase.add(leftEye);
        leftEye.position.y = 0.75;
        leftEye.position.x = -0.4;
        leftEye.position.z = -0.4;
        const rightEye = new THREE.Mesh( eyesGeometry, eyesMaterial );
        eyesBase.add(rightEye);
        rightEye.position.y = -0.75;
        rightEye.position.x = -0.4;
        rightEye.position.z = -0.4;
        pacman.add(eyesBase);

        const pacmanGroup = new THREE.Group();
        pacmanGroup.add(pacman);
        pacmanGroup.rotateY(Math.PI);
        pacmanGroup.name = "pacman";
        pacmanGroup.add(camera);
        // Other values
        pacmanGroup.CAMERA_DEFAULT_POS = new THREE.Vector3(0, 5, 10);
        pacmanGroup.DISTANCE = pacmanGroup.position.distanceTo(pacmanGroup.CAMERA_DEFAULT_POS);
        pacmanGroup.MOV_SPEED_X = 10;
        pacmanGroup.MOV_SPEED_Z = 10;
        pacmanGroup.WALL_COLLISION_RADIUS_FRONT = 1;
        pacmanGroup.WALL_COLLISION_RADIUS_SIDE = 1;
        pacmanGroup.WALL_COLLISION_RADIUS = 1;

        camera.position.set(0, 5, 10);
        camera.lookAt(pacmanGroup.position);
        camera.rotation.x = 0;

        // Hitbox Helper

        const pacmanHitboxHelper = new THREE.BoxHelper( pacman, 0x00ff00 );
        pacmanHitboxHelper.name = "pacman_hitboxHelper";
        pacmanHitboxHelper.visible = false;
        pacmanGroup.add(pacmanHitboxHelper);

        return pacmanGroup;
    },

    // ************************** //
    // Ghost
    // ************************** //
    createGhost: function(n, colorPrimary, colorSecondary){
        const ghostMaterial = new THREE.MeshPhongMaterial({ color: colorPrimary });
        const ghostTailSphereMaterial = new THREE.MeshToonMaterial({ color: colorSecondary });

        const ghost = new THREE.Group();
        ghost.name = "ghost_" + n;
    
        // Head
        const ghostHead = new THREE.Mesh( ghostHeadGeometry, ghostMaterial );
        ghostHead.name = ghost.name + "_head";
        ghost.add(ghostHead);
        // Body
        const ghostBody = new THREE.Mesh( ghostBodygeometry, ghostMaterial );
        ghostBody.castShadow = true;
        ghostBody.position.set(0, -0.5, 0);
        ghostBody.name = ghost.name + "_body";
        ghost.add(ghostBody);
        // Skirt
        const ghostSkirt = new THREE.Group();
        ghostSkirt.position.set(0, -1.1, 0);
    
        var ghostSkirtElement;
        const radius = 0.6;
        const nPoints = 10;
        // create some "cylinders" around the base of the body
        // https://math.stackexchange.com/questions/227481/x-points-around-a-circle
        for(var i = 0; i < nPoints; i++){
            ghostSkirtElement = new THREE.Mesh( ghostSkirtGeometry, ghostMaterial );
            ghostSkirt.add(ghostSkirtElement);
            ghostSkirtElement.position.x = radius * Math.cos((i * 2 * Math.PI) / nPoints);
            ghostSkirtElement.position.z = radius * Math.sin((i * 2 * Math.PI) / nPoints);
        }
        ghostSkirt.name = ghost.name + "_skirt";
        ghost.add(ghostSkirt);
    
        // Tail
        const ghostTail = new THREE.Group();
        ghostTail.name = ghost.name + "_tail";
        ghostTail.SCALE_DOWN_SPEED = -0.05;
        ghostTail.MIN_HEIGHT = -1;
        ghostTail.MIN_SPEED = 0.1;
        ghostTail.MAX_SPEED = 1;
        ghostTail.position.set(0, -1, 0);
    
        ghost.add(ghostTail);
        var ghostTailBubble, rPos;
        for(var i = 0; i < 15; i++){
            ghostTailBubble = new THREE.Mesh(ghostTailSphere, ghostTailSphereMaterial);
            ghostTail.add(ghostTailBubble);
            rPos = getRandomPosition(0.6, 0.4);
            ghostTailBubble.position.set(rPos.x, rPos.y, rPos.z);
        }
    
        // Normal Eyes
        const ghostEyesMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
        const ghostEyeRetinaMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
    
        const ghostLeftEye = new THREE.Group();
        ghostLeftEye.name = ghost.name + "_lefteye";
    
        const ghostLeftEyeBall = new THREE.Mesh( ghostEyesGeometry, ghostEyesMaterial );
        ghostLeftEyeBall.rotateX(Math.PI);
        const ghostLeftRetina = new THREE.Mesh( ghostEyeRetinaGeometry, ghostEyeRetinaMaterial );
        ghostLeftEye.add(ghostLeftRetina);
        ghostLeftEye.add(ghostLeftEyeBall);
        ghost.add(ghostLeftEye);
        ghostLeftEye.position.set(0.4, 0.1, 0.6);
        ghostLeftEye.rotateX(Math.PI/2);
    
        const ghostRightEye = new THREE.Group();
        ghostRightEye.name = ghost.name + "_righteye";
        const ghostRightEyeBall = new THREE.Mesh( ghostEyesGeometry, ghostEyesMaterial );
        ghostRightEyeBall.rotateX(Math.PI);
        const ghostRightRetina = new THREE.Mesh( ghostEyeRetinaGeometry, ghostEyeRetinaMaterial );
        ghostRightEye.add(ghostRightRetina);
        ghostRightEye.add(ghostRightEyeBall);
        ghostRightEye.position.set(-0.4, 0.1, 0.6);
        ghostRightEye.rotateX(Math.PI/2);
        ghost.add(ghostRightEye);

        // Scared
        const ghostRightEyeScared = new THREE.Mesh( ghostScaredEyesGeometry, ghostScaredEyesMaterial );
        ghostRightEyeScared.position.set(-0.4, 0.1, 0.6);
        const ghostLeftEyeScared = new THREE.Mesh( ghostScaredEyesGeometry, ghostScaredEyesMaterial );
        ghostLeftEyeScared.position.set(0.4, 0.1, 0.6);
        
        // Scared Mouth
        const ghostMouth = new THREE.Mesh( ghostMouthGeometry, ghostScaredEyesMaterial ) ;
        ghostMouth.position.set(0, 0, 0.81);
    
        const ghostScaredFace = new THREE.Group();
        ghostScaredFace.name = ghost.name + "_scaredface";
    
        ghostScaredFace.add(ghostRightEyeScared);
        ghostScaredFace.add(ghostLeftEyeScared);
        ghostScaredFace.add(ghostMouth);
        ghost.add(ghostScaredFace);
    
        // Scared properties 
        ghost.setScared = function() {
            ghostBody.material = ghostScaredMaterial;
            ghostHead.material = ghostScaredMaterial;
            ghostTail.traverse((child) => {
                child.material = ghostScaredMaterial;
            })
            ghostSkirt.traverse((child) => {
                child.material = ghostScaredMaterial;
            })
            ghostRightEye.visible = false;
            ghostLeftEye.visible = false;
            ghostScaredFace.visible = true;
        }
        


    
        // Not scared properties
        ghost.setNotScared = function() {
            ghostBody.material = ghostMaterial;
            ghostHead.material = ghostMaterial;
            ghostTail.traverse((child) => {
                child.material = ghostTailSphereMaterial;
            })
            ghostSkirt.traverse((child) => {
                child.material = ghostMaterial;
            })
            ghostRightEye.visible = true;
            ghostLeftEye.visible = true;
            ghostScaredFace.visible = false;
        }

        ghost.setNotScared();
        
    
        const ghostHitboxHelper = new THREE.BoxHelper( ghost, 0x00ff00 );
        ghostHitboxHelper.name = ghost.name + "_hitboxHelper";
        ghostHitboxHelper.visible = false;
        ghost.add(ghostHitboxHelper);
        
        // Properties
        ghost.BOB_SPEED = 0.25;
        ghost.BOB_MAX_HEIGHT = 2.4;
        ghost.BOB_MIN_HEIGHT = 1.8;
        ghost.MOV_SPEED_X = 8;
        ghost.MOV_SPEED_Z = 8;

        return ghost;
    },

    // ************************** //
    // Wall
    // ************************** //
    createWall: function(n, size){
        const wallGeometry = new THREE.BoxGeometry( size, 4, size );
        const wall = new THREE.Mesh( wallGeometry, wallMaterial );
        wall.name = "wall_" + n;
        wall.receiveShadow = true;

        return wall;
    },

    // ************************** //
    // Ground
    // ************************** //
    createGround: function(width, height){
        const groundGeometry = new THREE.PlaneGeometry(width, height);
        const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x362f31, side: THREE.DoubleSide });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        return ground;
    },

}
