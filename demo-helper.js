"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // ************************** //
        // Create the 3D scene
        // ************************** //
        sceneElements.sceneGraph = new THREE.Scene();

        // ************************** //
        // Pacman camera
        // ************************** //
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 600);
        sceneElements.camera = camera;

        // ************************** //
        // Free camera
        // ************************** //
        const freeCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        sceneElements.freeCamera = camera;
        const rectGeo = new THREE.BoxGeometry( 1, 1, 2 );
        const rectMat = new THREE.MeshToonMaterial( {color: 0x1d1957} );

        const rect = new THREE.Mesh( rectGeo, rectMat );
        freeCamera.add(rect);

        // *********************************** //
        // Create renderer (with shadow map)
        // *********************************** //
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor('rgb(0, 150, 255)', 0.4);
        renderer.setSize(width, height);
        renderer.MIN_INTENSITY = 0.4;
        renderer.MAX_INTENSITY = 0.6;
        renderer.SPEED = 0.1;

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        // **************************************** //
        // Add the rendered image in the HTML DOM
        // **************************************** //
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);

        // ************************** //
        // Control for the camera
        // ************************** //
        sceneElements.control = new THREE.OrbitControls(camera, renderer.domElement);
        //sceneElements.control.enabled = false;
        //sceneElements.control.screenSpacePanning = true;
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};
