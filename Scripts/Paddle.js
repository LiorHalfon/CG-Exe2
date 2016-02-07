
// Globals:
//===========
var paddleRadius = 15, handleDepth = 12;
var paddleThickness = 2;

var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 5, paddleMaxSpeed = 8;
var hitStr = 5, paddleOpacity = 0.6;
var isSpacePressed = false, spaceKeyTimer = 0, INITIAL_SPACE_KEY_TIME = 800;
////////////////////////////

function PaddleBuilder() {
    this.paddle = new THREE.Object3D();
    this.paddleRadiusSegments = 20;

    // PaddleBuilder handle:
    this.handleHeight = paddleThickness;
    this.handleWidth = 4;

    this.createPaddle = function( color, isTransparent ){
        // Create PaddleBuilder 2 side planes
        var paddleGeometry = new THREE.CircleGeometry(paddleRadius, paddleRadius,
            paddleThickness,
            this.paddleRadiusSegments);
        var paddleGeometry = new THREE.CircleGeometry(paddleRadius,
            this.paddleRadiusSegments);

        var paddleTexture, paddleColor
        if (color=="red"){
            paddleTexture = THREE.ImageUtils.loadTexture("textures/red-paddle-texture.jpg");
            paddleColor = 0x994444;
        }else{
            paddleTexture = THREE.ImageUtils.loadTexture("textures/blue-paddle-texture.jpg");
            paddleColor = 0x444499;
        }

        var paddleMaterial = new THREE.MeshLambertMaterial({
            map: paddleTexture,
            color: paddleColor,
            opacity: paddleOpacity,
            transparent: isTransparent
        });
        paddleMaterial.side = THREE.DoubleSide;

        var paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
        paddleMesh.castShadow = true;
        paddleMesh.receiveShadow = true;

        paddleMesh.rotation.y = deg90;
        paddleMesh.rotation.x = deg90;
        paddleMesh.rotation.z = -deg90;

        var paddleMesh2 = paddleMesh.clone();
        paddleMesh.position.x = -paddleThickness/2;
        paddleMesh2.position.x = paddleThickness/2;

        this.paddle.add(paddleMesh);
        this.paddle.add(paddleMesh2);

        // Create wrapping of the paddle
        var wrapGeo = new THREE.CylinderGeometry( paddleRadius, paddleRadius,
            paddleThickness, this.paddleRadiusSegments, 1,
        true
        );

        var wrapMat = new THREE.MeshLambertMaterial({color: 0x111111, opacity: paddleOpacity, transparent: isTransparent});
        var wrap = new THREE.Mesh(wrapGeo, wrapMat);
        wrap.rotation.z = deg90;
        this.paddle.add(wrap);

        // Create Handle
        var handleGeometry = new THREE.CubeGeometry(this.handleWidth,
            this.handleHeight,
            handleDepth);

        var handleMaterial = new THREE.MeshLambertMaterial({color: 0x777777, opacity: paddleOpacity, transparent: isTransparent,
           map: THREE.ImageUtils.loadTexture("textures/wood.jpg")});

        var handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
        handleMesh.castShadow = true;
        handleMesh.receiveShadow = true;
        handleMesh.position.z = -paddleRadius - handleDepth/2;
        handleMesh.rotation.z = deg90;

        this.paddle.add(handleMesh);

        return this.paddle;
    };
    return true;
}