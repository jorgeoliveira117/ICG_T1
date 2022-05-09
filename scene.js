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
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

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

//////////////////////////////////////////////////////////////////


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // ************************** //
    // Create a ground plane
    // ************************** //
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    sceneGraph.add(planeObject);

    // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject.receiveShadow = true;


}

// Displacement value

var delta;


var dispX = 10, dispZ = 10;
var lastTime = 0;

// Goes from 0 to 2*Math.PI


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
    

    if (keyD && pacman.position.x < 5) {
        pacman.translateX(dispX * delta);
    }
    if (keyW && pacman.position.z > -5) {
        pacman.translateZ(-dispZ * delta);
    }
    if (keyA && pacman.position.x > -5) {
        pacman.translateX(-dispX * delta);
    }
    if (keyS && pacman.position.z < 5) {
        pacman.translateZ(dispZ * delta);
    }
    sceneElements.camera.lookAt(pacman.position);
    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}