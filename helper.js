"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // ************************** //
        // Create the 3D scene
        // ************************** //
        sceneElements.sceneGraph = new THREE.Scene();

        // ************************** //
        // Normal camera
        // ************************** //
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 600);
        sceneElements.camera = camera;
        
        // ************************** //
        // Mini-map camera
        // ************************** //
        const miniCamera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 300);
        //= new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
        miniCamera.miniCameraWidth = 0
        miniCamera.miniCameraHeight = 0 
        sceneElements.miniCamera = miniCamera;
        


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
        // Adapted from:
        // https://threejs.org/examples/webgl_multiple_views.html
        const windowSize = new THREE.Vector2();
        sceneElements.renderer.getSize(windowSize);
        
        const width = windowSize.x;
        const height = windowSize.y;
        
        // Normal Camera
        sceneElements.renderer.setViewport( 0, 0, width, height );
        //sceneElements.renderer.setScissor( 0, 0, width, height );
        //sceneElements.renderer.setScissorTest( true );
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);


        //sceneElements.miniCamera.mapHeight
        // Minimap Camera

        const MAP_SCALE = 0.3;
        const MAX_MAP_HEIGHT = 0.3; // Maximum Minimap Height % of the screen
        const MAX_MAP_WIDTH = 0.45; // Maximum Minimap Width % of the screen

        var minimapHeight = windowSize.y * MAP_SCALE;
        var minimapWidth = windowSize.y * MAP_SCALE * sceneElements.miniCamera.mapAspectRatio;

        
        if(minimapWidth > width * MAX_MAP_WIDTH){
            minimapHeight = minimapHeight * ( width * MAX_MAP_WIDTH / minimapWidth);
            minimapWidth = width * MAX_MAP_WIDTH;
        }
        if(minimapHeight > height * MAX_MAP_HEIGHT){
            minimapWidth = minimapWidth * ( height * MAX_MAP_HEIGHT / minimapHeight);
            minimapHeight = height * MAX_MAP_HEIGHT;
        }
        sceneElements.renderer.setViewport( 
            0.99 * width - minimapWidth, 
            0.99 * height - minimapHeight, 
            minimapWidth, 
            minimapHeight );
        sceneElements.renderer.setScissor( 
            0.99 * width - minimapWidth, 
            0.99 * height - minimapHeight, 
            minimapWidth, 
            minimapHeight  );
        sceneElements.renderer.setScissorTest( true );

        // Change scale of everything
        // Idea from: https://github.com/butchler/Pacman-3D/blob/gh-pages/game.js -> renderHud function
        sceneElements.sceneGraph.children.forEach(
            (child) => {
                if(!child.name.includes("portal") && !child.name.includes("ground") && !child.name.includes("wall"))
                    child.scale.set(3, 3, 3);
            });

        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.miniCamera);

        sceneElements.sceneGraph.children.forEach(
            (child) => {
                if(!child.name.includes("portal") && !child.name.includes("ground") && !child.name.includes("wall"))
                    child.scale.set(1, 1, 1);
            });


        sceneElements.renderer.setScissorTest( false );
    },
};
