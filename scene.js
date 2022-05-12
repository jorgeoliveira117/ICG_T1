"use strict";

//  Adapted from Daniel Rohmer tutorial
//
// 		https://imagecomputing.net/damien.rohmer/teaching/2019_2020/semester_1/MPRI_2-39/practice/threejs/content/000_threejs_tutorial/index.html
//
//  And from an example by Pedro Iglésias
//
// 		J. Madeira - April 2021


// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
};


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
    const planeGeometry = new THREE.PlaneGeometry(40, 40);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x362f31, side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    sceneGraph.add(planeObject);

    // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject.receiveShadow = true;

    // ************************** //
    // Wall
    // ************************** //
    const wallGeometry = new THREE.BoxGeometry( 5, 6, 5 );
    const wallMaterial = new THREE.MeshToonMaterial( {color: 0x1d1957} );
    const wall = new THREE.Mesh( wallGeometry, wallMaterial );
    wall.position.set(5, 3, 5);
    wall.receiveShadow = true;
    wall.name = "wall#1";
    sceneGraph.add( wall );
    const wall2 = new THREE.Mesh( wallGeometry, wallMaterial );
    wall2.position.set(5, 3, 10);
    const wall3 = new THREE.Mesh( wallGeometry, wallMaterial );
    wall3.position.set(-5, 3, 5);
    const wall4 = new THREE.Mesh( wallGeometry, wallMaterial );
    wall4.position.set(-5, 3, 10);
    const wall5 = new THREE.Mesh( wallGeometry, wallMaterial );
    wall5.position.set(200, 3, 2);
    sceneGraph.add( wall2 );
    sceneGraph.add( wall3 );
    sceneGraph.add( wall4 );
    sceneGraph.add( wall5 );

    // ************************** //
    // Point
    // ************************** //
    const pointGeometry = new THREE.SphereGeometry( 0.25, 16, 8 );
    const pointMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(0,0,135)', emissive: 'rgb(0,200,255)', specular: 'rgb(255,255,255)', shininess: 120 });
    const point = new THREE.Mesh( pointGeometry, pointMaterial );
    point.castShadow = true;
    point.position.set(-10, 1.5, 3);
    sceneGraph.add( point );
    // ************************** //
    // PowerUp
    // ************************** //
    const powerUpGeometry = new THREE.SphereGeometry( 0.5, 32, 16 );
    const powerUpMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(255,200,0)', emissive: 'rgb(255,240,75)', specular: 'rgb(255,255,255)', shininess: 20 });
    const powerUp = new THREE.Mesh( powerUpGeometry, powerUpMaterial );
    powerUp.position.set(10, 1.5, 3);
    powerUp.castShadow = true;
    
    const light = new THREE.PointLight( 0xFFFF00, 2, 10 );
    //light.position.set( 50, 50, 50 );
    powerUp.add( light );
    
    sceneGraph.add( powerUp );

    // ************************** //
    // Ghost
    // ************************** //
    const ghost = new THREE.Group();
    ghost.name = "ghost_1";
    sceneGraph.add(ghost);
    
    ghost.position.set(0, 2, -3);
    ghost.rotateY(Math.PI);

    const ghostMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    // Head
    const ghostHeadGeometry = new THREE.SphereGeometry( 0.8, 32, 16, 0, 2*Math.PI, 0, Math.PI/2 );
    const ghostHead = new THREE.Mesh( ghostHeadGeometry, ghostMaterial );
    ghostHead.name = ghost.name + "_head";
    ghost.add(ghostHead);
    // Body
    const ghostBodygeometry = new THREE.CylinderGeometry( 0.8, 0.8, 1, 32 );
    const ghostBody = new THREE.Mesh( ghostBodygeometry, ghostMaterial );
    ghostBody.castShadow = true;
    ghostBody.position.set(0, -0.5, 0);
    ghostBody.name = ghost.name + "_body";
    ghost.add(ghostBody);

    // Tail
    const ghostTail = new THREE.Group();
    ghostTail.name = ghost.name + "_tail";
    ghostTail.SCALE_DOWN_SPEED = -0.05;
    ghostTail.MIN_HEIGHT = -1;
    ghostTail.MIN_SPEED = 0.1;
    ghostTail.MAX_SPEED = 1;
    ghostTail.position.set(0, -1, 0);

    ghost.add(ghostTail);
    const ghostTailSphere = new THREE.SphereGeometry(0.2, 8, 4);
    const ghostTailSphereMaterial = new THREE.MeshToonMaterial({ color: 0xAA0000 });
    var ghostTailBubble, rPos;
    for(var i = 0; i < 15; i++){
        ghostTailBubble = new THREE.Mesh(ghostTailSphere, ghostTailSphereMaterial);
        ghostTail.speed = Math.random()*ghostTail.MAX_SPEED + ghostTail.MIN_SPEED;
        ghostTail.add(ghostTailBubble);
        rPos = getRandomPosition(0.6, 0.4);
        ghostTailBubble.position.set(rPos.x, rPos.y, rPos.z);
    }

    // Normal Eyes
    const ghostEyesGeometry = new THREE.SphereGeometry( 0.2, 16, 16, 0, 2*Math.PI, 0, Math.PI-Math.PI/6);
    const ghostEyesMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    const ghostEyeRetinaGeometry = new THREE.SphereGeometry( 0.2, 16, 16, 0, 2*Math.PI, 0, Math.PI/6);
    const ghostEyeRetinaMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );

    const ghostLeftEye = new THREE.Group();
    ghostLeftEye.name = ghost.name + "_lefteye";

    const ghostLeftEyeBall = new THREE.Mesh( ghostEyesGeometry, ghostEyesMaterial );
    ghostLeftEyeBall.rotateX(Math.PI);
    const ghostLeftRetina = new THREE.Mesh( ghostEyeRetinaGeometry, ghostEyeRetinaMaterial );
    ghostLeftEye.add(ghostLeftRetina);
    ghostLeftEye.add(ghostLeftEyeBall);
    ghostLeftEye.position.set(0.4, 0.1, 0.6);
    ghostLeftEye.rotateX(Math.PI/2);
    ghost.add(ghostLeftEye);

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
    const ghostScaredEyesGeometry = new THREE.SphereGeometry( 0.2, 16, 16);
    const ghostScaredEyesMaterial = new THREE.MeshBasicMaterial( { color: 0xF5F0CB, side: THREE.DoubleSide } );
    const ghostRightEyeScared = new THREE.Mesh( ghostScaredEyesGeometry, ghostScaredEyesMaterial );
    ghostRightEyeScared.position.set(-0.4, 0.1, 0.6);
    const ghostLeftEyeScared = new THREE.Mesh( ghostScaredEyesGeometry, ghostScaredEyesMaterial );
    ghostLeftEyeScared.position.set(0.4, 0.1, 0.6);
    
    

    const ghostScaredMaterial = new THREE.MeshPhongMaterial({ color: 0x2129FF, emissive: 0x2129FF, specular: 0x2129FF, shininess: 20 });
    
    // Scared Mouth

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
    const ghostMouth = new THREE.Mesh( ghostMouthGeometry, ghostScaredEyesMaterial ) ;
    ghostMouth.position.set(0, 0, 0.81);

    const ghostScaredFace = new THREE.Group();
    ghostScaredFace.name = ghost.name + "_scaredface";

    ghostScaredFace.add(ghostRightEyeScared);
    ghostScaredFace.add(ghostLeftEyeScared);
    ghostScaredFace.add(ghostMouth);
    ghost.add(ghostScaredFace);
    
    // Scared properties 
    ghostBody.material = ghostScaredMaterial;
    ghostHead.material = ghostScaredMaterial;
    ghostTail.traverse((child) => {
        child.material = ghostScaredMaterial;
    })
    ghostRightEye.visible = false;
    ghostLeftEye.visible = false;
    ghostScaredFace.visible = true;
    

    // Not scared properties
    ghostBody.material = ghostMaterial;
    ghostHead.material = ghostMaterial;
    ghostTail.traverse((child) => {
        child.material = ghostTailSphereMaterial;
    })
    ghostRightEye.visible = true;
    ghostLeftEye.visible = true;
    ghostScaredFace.visible = false;



    
    // Properties
    ghost.BOB_SPEED = 0.25;
    ghost.BOB_MAX_HEIGHT = 2.4;
    ghost.BOB_MIN_HEIGHT = 1.8;

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

    return new THREE.Vector3(x, Math.random() * y, z);
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
        pacman.translateX(dispX * delta);
    }
    if (keyW ) {
        pacman.translateZ(-dispZ * delta);
    }
    if (keyA ) {
        pacman.translateX(-dispX * delta);
    }
    if (keyS ) {
        pacman.translateZ(dispZ * delta);
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

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}