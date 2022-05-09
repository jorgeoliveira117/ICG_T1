"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // ************************** //
        // Create the 3D scene
        // ************************** //
        sceneElements.sceneGraph = new THREE.Scene();


        // ************************** //
        // Add camera
        // ************************** //
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        sceneElements.camera = camera;
        

        // ************************** //
        // Create Pacman
        // ************************** //
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
        const rightEyeBase = new THREE.Group();
        eyesBase.add(rightEye);
        rightEye.position.y = -0.75;
        rightEye.position.x = -0.4;
        rightEye.position.z = -0.4;
        pacman.add(eyesBase);




        const pacmanGroup = new THREE.Group();
        pacmanGroup.add(pacman);
        pacmanGroup.add(camera);
        pacmanGroup.translateY(1.5);
        pacmanGroup.name = "pacman";

        //camera.position.set(0, 5, 5);
        camera.translateY(10);
        camera.translateZ(20);
        camera.lookAt(pacmanGroup.position);
        camera.rotation.x = 0;
        
        
        sceneElements.sceneGraph.add(pacmanGroup);



        // ************************** //
        // Illumination
        // ************************** //

        // ************************** //
        // Add ambient light
        // ************************** //
        const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
        sceneElements.sceneGraph.add(ambientLight);

        // ***************************** //
        // Add spotlight (with shadows)
        // ***************************** //
        const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 0.8);
        spotLight.position.set(0, 100, 0);
        sceneElements.sceneGraph.add(spotLight);

        // Setup shadow properties for the spotlight
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;

        // Give a name to the spot light
        spotLight.name = "light";


        // *********************************** //
        // Create renderer (with shadow map)
        // *********************************** //
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor('rgb(255, 255, 150)', 1.0);
        renderer.setSize(width, height);

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        // **************************************** //
        // Add the rendered image in the HTML DOM
        // **************************************** //
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);

        // ************************** //
        // NEW --- Control for the camera
        // ************************** //
        sceneElements.control = new THREE.OrbitControls(camera, renderer.domElement);
        //sceneElements.control.enabled = false;
        //sceneElements.control.screenSpacePanning = true;
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};