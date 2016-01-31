// GLOBALS: ///////////////////////////////////////////////////////
// scene object variables
var renderer, scene, camera, pointLight, spotLight;

// field variables
var fieldWidth = 400, fieldHeight = 200, fieldDepth = 50;

// net variables
var netSideWidth = 5, netSideHeight = 30, netSideDepth = 4;
var netTopRowHeight = netSideHeight - 3, netDepth = 2, netRowHeight = 2;
var netColumnTop = netTopRowHeight - 2, netColumnButtom = 5, netGapBetweenColumns = 4;
var netRows = 5, netColumns = 32;

// ball variables
var ball, paddle1, paddle2;
var ballInitX = 3, ballInitY = 0.2, ballInitZ = 1.5;
var ballDirX = ballInitX, ballDirY = ballInitY, ballDirZ = ballInitZ, ballSpeed = 1;
var BALL_MAX_HEIGHT = 50, ballZSpeed = 0.15;
var ballRadius = 4;
var GAME_START_TIME = 1000, startTimer = GAME_START_TIME;

// ball physics variables
var gravity = 0.1, ballInactive = false;

// game-related variables
var score1 = 0, score2 = 0, gameOver = false;

// you can change this to any positive whole number
var maxScore = 7;

// set opponent reflexes (1 - easiest, 5 - hardest)
var difficulty = 4;

//Utils:
var deg90 = Math.PI / 2;
////////////////////////////////////////////////////////////////////

function setup() {
    // now reset player and opponent scores
    score1 = 0;
    score2 = 0;

    // set up all the 3D objects in the scene
    createScene();

    // and let's get cracking!
    draw();
}

function createScene() {
    // set the scene size
    var WIDTH = window.innerWidth - 10,
        HEIGHT = 520;

    // set some camera attributes
    var VIEW_ANGLE = 50,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    var c = document.getElementById("gameCanvas");

    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer();
    camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR);

    scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);

    // set a default position for the camera
    // not doing this somehow messes up shadow rendering
    camera.position.z = 320;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x87CEEB);

    // attach the render-supplied DOM element
    c.appendChild(renderer.domElement);

    // set up the playing surface plane
    var planeWidth = fieldWidth,
        planeHeight = fieldHeight,
        planeQuality = 10;

    // create the paddle1's material
    var paddle1Material =
        new THREE.MeshLambertMaterial(
            {
                color: 0x1B32C0
            });
    // create the paddle2's material
    var paddle2Material =
        new THREE.MeshLambertMaterial(
            {
                color: 0xFF4045
            });
    // create the plane's material
    var planeMaterial =
        new THREE.MeshLambertMaterial(
            {
                map: THREE.ImageUtils.loadTexture("textures/blueTable.jpg"),
                color: 0x777777
            });

    // create the pillar's material
    var pillerTexture = THREE.ImageUtils.loadTexture("textures/pillar_texture.jpg");
    pillerTexture.wrapS = THREE.RepeatWrapping;
    pillerTexture.wrapT = THREE.RepeatWrapping;
    pillerTexture.repeat.set(4, 1);
    var pillarMaterial =
        new THREE.MeshLambertMaterial(
            {
                map: pillerTexture,
                color: 0xaaaaaa
            });
    // create the ground's material
    var grassTexture = THREE.ImageUtils.loadTexture("textures/grass_texture.jpg");
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(16, 16);
    var groundMaterial =
        new THREE.MeshLambertMaterial(
            {
                map: grassTexture,
                color: 0xcccccc
            });


    // create the playing surface plane
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(
            planeWidth,
            planeHeight,
            planeQuality,
            planeQuality),

        planeMaterial);

    scene.add(plane);
    plane.receiveShadow = true;

    var shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: THREE.ImageUtils.loadTexture("textures/shadow.png"),
        transparent: true
    });
    var shadowPlane = new THREE.PlaneGeometry(fieldWidth * 2, fieldHeight * 2);
    var shadow = new THREE.Mesh(shadowPlane, shadowMaterial);
    shadow.depthTest = false;
    scene.add(shadow);

    // // set up the sphere vars
    // lower 'segment' and 'ring' values will increase performance
    var radius = ballRadius,
        segments = 6,
        rings = 6;

    // // create the sphere's material
    var sphereMaterial =
        new THREE.MeshLambertMaterial(
            {
               // color: 0xD43001
                color: 0x777777
            });

    // Create a ball with sphere geometry
    ball = new THREE.Mesh(
        new THREE.SphereGeometry(
            radius,
            segments,
            rings),

        sphereMaterial);

    // add the sphere to the scene
    scene.add(ball);

    ball.position.x = 0;
    ball.position.y = 0;
    // set ball above the table surface
    ball.position.z = radius + 35;
    ball.receiveShadow = true;
    ball.castShadow = true;

    paddle1 = new Paddle().createPaddle("blue");
    scene.add(paddle1);
    paddle1.receiveShadow = true;
    paddle1.castShadow = true;


    paddle2 = new Paddle().createPaddle("red");

    // // add the sphere to the scene
    scene.add(paddle2);
    paddle2.receiveShadow = true;
    paddle2.castShadow = true;

    // set paddles on each side of the Table
    paddle1.position.x = -fieldWidth / 2 + paddleThickness;
    paddle2.position.x = fieldWidth / 2 - paddleThickness;

    // lift paddles over playing surface
    paddle1.position.z = 30;
    paddle2.position.z = 30;

    // we iterate 10x (5x each side) to create pillars to show off shadows
    // this is for the pillars on the left
    for (var i = 0; i < 5; i++) {
        var backdrop = new THREE.Mesh(
            new THREE.CubeGeometry(
                30,
                30,
                300,
                10,
                10,
                10),

            pillarMaterial);

        backdrop.position.x = -50 + i * 100;
        backdrop.position.y = 230;
        backdrop.position.z = -30;
        backdrop.castShadow = true;
        backdrop.receiveShadow = true;
        scene.add(backdrop);
    }
    // we iterate 10x (5x each side) to create pillars to show off shadows
    // this is for the pillars on the right
    for (var i = 0; i < 5; i++) {
        var backdrop = new THREE.Mesh(
            new THREE.CubeGeometry(
                30,
                30,
                300,
                10,
                10,
                10),

            pillarMaterial);

        backdrop.position.x = -50 + i * 100;
        backdrop.position.y = -230;
        backdrop.position.z = -30;
        backdrop.castShadow = true;
        backdrop.receiveShadow = true;
        scene.add(backdrop);
    }

    // finally we finish by adding a ground plane
    var ground = new THREE.Mesh(
        new THREE.CubeGeometry(
            4000,
            4000,
            3,
            1,
            1,
            1),

        groundMaterial);
    // set ground to arbitrary z position to best show off shadowing
    ground.position.z = -132;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create net right side
    var netRightSideGeometry = new THREE.Geometry();
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(-2) - netSideWidth, 0.0));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(-2) - netSideWidth, netSideHeight));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(-2), netSideHeight));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(-2), 0.0));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(-2), 0.0));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(-2), netSideHeight));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(-2) - netSideWidth, netSideHeight));
    netRightSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(-2) - netSideWidth, 0.0));

    netRightSideGeometry.faces.push(new THREE.Face3(0, 1, 2));
    netRightSideGeometry.faces.push(new THREE.Face3(0, 2, 3));
    netRightSideGeometry.faces.push(new THREE.Face3(2, 3, 4));
    netRightSideGeometry.faces.push(new THREE.Face3(3, 4, 5));
    netRightSideGeometry.faces.push(new THREE.Face3(4, 5, 6));
    netRightSideGeometry.faces.push(new THREE.Face3(5, 6, 7));
    netRightSideGeometry.faces.push(new THREE.Face3(6, 7, 0));
    netRightSideGeometry.faces.push(new THREE.Face3(7, 0, 1));

    var netRightSideMaterial = new THREE.MeshBasicMaterial({
        color:0xFFFFFF,
        side:THREE.DoubleSide
    });

    var netRightSideMesh = new THREE.Mesh(netRightSideGeometry, netRightSideMaterial);
    netRightSideMesh.position.set(0.0, 0.0, 0.0);

    netRightSideMesh.receiveShadow = true;
    netRightSideMesh.castShadow = true;

    scene.add(netRightSideMesh);

    // Create net left side
    var netLeftSideGeometry = new THREE.Geometry();
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(2) + netSideWidth, 0.0));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(2) + netSideWidth, netSideHeight));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(2), netSideHeight));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0, fieldHeight/(2), 0.0));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(2), 0.0));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(2), netSideHeight));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(2) + netSideWidth, netSideHeight));
    netLeftSideGeometry.vertices.push(new THREE.Vector3(-2.0 + netSideDepth, fieldHeight/(2) + netSideWidth, 0.0));

    netLeftSideGeometry.faces.push(new THREE.Face3(0, 1, 2));
    netLeftSideGeometry.faces.push(new THREE.Face3(0, 2, 3));
    netLeftSideGeometry.faces.push(new THREE.Face3(2, 3, 4));
    netLeftSideGeometry.faces.push(new THREE.Face3(3, 4, 5));
    netLeftSideGeometry.faces.push(new THREE.Face3(4, 5, 6));
    netLeftSideGeometry.faces.push(new THREE.Face3(5, 6, 7));
    netLeftSideGeometry.faces.push(new THREE.Face3(6, 7, 0));
    netLeftSideGeometry.faces.push(new THREE.Face3(7, 0, 1));

    var netLeftSideMaterial = new THREE.MeshBasicMaterial({
        color:0xFFFFFF,
        side:THREE.DoubleSide
    });

    var netLeftSideMesh = new THREE.Mesh(netLeftSideGeometry, netLeftSideMaterial);
    netLeftSideMesh.position.set(0.0, 0.0, 0.0);

    netLeftSideMesh.receiveShadow = true;
    netLeftSideMesh.castShadow = true;

    scene.add(netLeftSideMesh);

    // Create array of net rows
    var netRowsGeometryArray = [];
    var netMeshArray = [];

    var netMaterial = new THREE.MeshBasicMaterial({
        color:0x000000,
        side:THREE.DoubleSide
    });

    for(i = 0; i < netRows; i++)
    {
        // Create net
        var netGeometry = new THREE.Geometry();
        netGeometry.vertices.push(new THREE.Vector3(1.0, fieldHeight/(2), netTopRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0, fieldHeight/(2), netTopRowHeight - netRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth, fieldHeight/(2),
            netTopRowHeight - netRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth, fieldHeight/(2), netTopRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth, fieldHeight/(-2), netTopRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth, fieldHeight/(-2),
            netTopRowHeight - netRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0, fieldHeight/(-2), netTopRowHeight - netRowHeight - i*5));
        netGeometry.vertices.push(new THREE.Vector3(1.0, fieldHeight/(-2), netTopRowHeight - i*5));

        netGeometry.faces.push(new THREE.Face3(0, 1, 2));
        netGeometry.faces.push(new THREE.Face3(1, 2, 3));
        netGeometry.faces.push(new THREE.Face3(2, 3, 4));
        netGeometry.faces.push(new THREE.Face3(3, 4, 5));
        netGeometry.faces.push(new THREE.Face3(2, 5, 6));
        netGeometry.faces.push(new THREE.Face3(1, 5, 6));
        netGeometry.faces.push(new THREE.Face3(6, 7, 0));
        netGeometry.faces.push(new THREE.Face3(6, 7, 1));
        netGeometry.faces.push(new THREE.Face3(7, 4, 0));
        netGeometry.faces.push(new THREE.Face3(7, 4, 3));

        netRowsGeometryArray.push(netGeometry);

        var netMesh = new THREE.Mesh(netGeometry, netMaterial);
        netMesh.position.set(0.0, 0.0, 0.0);

        netMesh.receiveShadow = true;
        netMesh.castShadow = true;

        netMeshArray.push(netMesh);

        scene.add(netMesh);
    }

    // Create array of net columns
    var netColumnsGeometryArray = [];

    for(i = 1; i <= netColumns; i++)
    {
        // Create net
        var netGeometry = new THREE.Geometry();
        netGeometry.vertices.push(new THREE.Vector3(1.0, fieldHeight/(2) - i*(netGapBetweenColumns + netDepth),
            netColumnTop));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth,
            fieldHeight/(2) - i*(netGapBetweenColumns + netDepth), netColumnTop));
        netGeometry.vertices.push(new THREE.Vector3(1.0, fieldHeight/(2) - i*(netGapBetweenColumns + netDepth),
            netColumnButtom));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth,
            fieldHeight/(2) - i*(netGapBetweenColumns + netDepth), netColumnButtom));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth,
            fieldHeight/(2) - i*(netGapBetweenColumns + netDepth) - netDepth, netColumnButtom));
        netGeometry.vertices.push(new THREE.Vector3(1.0 - netDepth,
            fieldHeight/(2) - i*(netGapBetweenColumns + netDepth) - netDepth, netColumnTop));
        netGeometry.vertices.push(new THREE.Vector3(1.0,
            fieldHeight/(2) - i*(netGapBetweenColumns + netDepth) - netDepth, netColumnTop));
        netGeometry.vertices.push(new THREE.Vector3(1.0,
            fieldHeight/(2) - i*(netGapBetweenColumns + netDepth) - netDepth, netColumnButtom));

        netGeometry.faces.push(new THREE.Face3(0, 1, 2));
        netGeometry.faces.push(new THREE.Face3(1, 2, 3));
        netGeometry.faces.push(new THREE.Face3(1, 3, 4));
        netGeometry.faces.push(new THREE.Face3(3, 4, 5));
        netGeometry.faces.push(new THREE.Face3(4, 5, 6));
        netGeometry.faces.push(new THREE.Face3(5, 6, 7));
        netGeometry.faces.push(new THREE.Face3(6, 7, 0));
        netGeometry.faces.push(new THREE.Face3(7, 0, 2));

        netColumnsGeometryArray.push(netGeometry);

        var netMesh = new THREE.Mesh(netGeometry, netMaterial);
        netMesh.position.set(0.0, 0.0, 0.0);

        netMesh.receiveShadow = true;
        netMesh.castShadow = true;

        netMeshArray.push(netMesh);

        scene.add(netMesh);
    }

    shadow.position.set(0, 0, ground.position.z + 20);

    // // create a point light
    pointLight =
        new THREE.PointLight(0xF8D898);

    // set its position
    pointLight.position.x = -1000;
    pointLight.position.y = 0;
    pointLight.position.z = 1000;
    pointLight.intensity = 2.9;
    pointLight.distance = 10000;
    // add to the scene
    scene.add(pointLight);

    // add a spot light
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    renderer.shadowMapEnabled = true;
}

function draw() {
    // draw THREE.JS scene
    renderer.render(scene, camera);
    // loop draw function call
    requestAnimationFrame(draw);

    ballPhysics();
    paddlePhysics();
    cameraPhysics();
    playerPaddleMovement();
    opponentPaddleMovement();
}

function ballPhysics() {
    //delay in the beginning
    if (startTimer > 0 || gameOver === true) {
        startTimer -= 18; // frame time
        return;
    }

    ballDirZ -= gravity;

    // if ball goes off the 'left' side (Player's side)
    if (ball.position.x <= -fieldWidth / 2) {
        cpuScores();
    }

    // if ball goes off the 'right' side (CPU's side)
    if (ball.position.x >= fieldWidth / 2) {
        playerScores();
    }

    // hit on floor
    if (ball.position.z - ballRadius <= 0) {
        if (ball.position.y > fieldHeight / 2 || ball.position.y < -fieldHeight / 2) {
            if (ballDirX > 0) {
                cpuScores();
                return;
            }
            else {
                playerScores();
                return;
            }
        }
        ball.position.z = ballRadius;
        ballDirZ *= -0.9;
        ballDirX *= 0.8;
        ballDirY *= 0.9;

        if (Math.abs(ballDirZ) < 0.2) {
            resetBall(0);
        } else {
            //play ball hit table sound
            var rnd = Math.floor(Math.random() * 3);
            Sound.playStaticSound(Sound["table" + rnd], 0.6 + Math.random() * 0.4);
        }
    }


    // update ball position over time
    ball.position.x += ballDirX * ballSpeed;
    ball.position.y += ballDirY * ballSpeed;
    ball.position.z += ballDirZ;
}

// Handles CPU paddle movement and logic
function opponentPaddleMovement() {
    if (ballDirX > 0) {
        // Lerp towards the ball on the y plane
        paddle2DirY = Math.sign(ball.position.y - paddle2.position.y) * paddleSpeed / 10 * difficulty;
    }
    else {
        paddle2DirY = 0;
    }

    if (Math.abs(ball.position.y - paddle2.position.y) <= Math.abs(paddle2DirY)) {
        paddle2DirY = (ball.position.y - paddle2.position.y);
    }

    paddle2.position.y += paddle2DirY;

    //Follow the ball height
    if (ball.position.z <= paddleRadius + handleDepth || ballDirX < 0)
    {
        paddle2.position.z += (paddleRadius + handleDepth - paddle2.position.z) * 0.02;
    }else{
        paddle2.position.z += (ball.position.z - paddle2.position.z) * 0.05;
    }

    // Rotate paddle when moving left and right
    paddle2.rotation.x = -paddle2.position.y * deg90/(fieldHeight/2);
}


// Handles player's paddle movement
function playerPaddleMovement() {
    // move left
    if (Key.isDown(Key.A)) {
        // if paddle is not touching the boundary
        // we move
        if (paddle1.position.y < fieldHeight) {
            if (paddle1DirY <= 0) {
                paddle1DirY = paddleSpeed * 0.5;
            } else if (Math.abs(paddle1DirY) < paddleMaxSpeed){
                paddle1DirY *= 1.05;
            }
        }
        // Paddle cant move
        else {
            paddle1DirY = 0;
        }
    }
    // move right
    else if (Key.isDown(Key.D)) {
        if (paddle1.position.y > -fieldHeight) {
            if (paddle1DirY >= 0) {
                paddle1DirY = -paddleSpeed * 0.5;
            }
            else if (Math.abs(paddle1DirY) < paddleMaxSpeed) {
                paddle1DirY *= 1.05;
            }
        }
        else {
            paddle1DirY = 0;
        }
    }
    // else don't move paddle
    else {
        // stop the paddle
        paddle1DirY = 0;
    }

    if (Key.isDown(Key.SPACE) && !isSpacePressed) {
        isSpacePressed = true;
        spaceKeyTimer = INITIAL_SPACE_KEY_TIME;
        paddle1.rotation.y = -deg90/2;
    }

    if (isSpacePressed) {
        paddle1.rotation.y += (deg90 - paddle1.rotation.y) * 0.08;
        spaceKeyTimer -= 16;
        if (spaceKeyTimer <= 0)
            isSpacePressed = false;
    }else{
        //take paddle back to normal position
        paddle1.rotation.y -= paddle1.rotation.y * 0.05;
    }

    //Follow the ball height
    if (ball.position.z <= paddleRadius + handleDepth || ballDirX > 0)
    {
        paddle1.position.z += (paddleRadius + handleDepth - paddle1.position.z) * 0.02;
    }else{
        paddle1.position.z += (ball.position.z - paddle1.position.z) * 0.05;
    }

    //Move paddle left and right
    paddle1.position.y += paddle1DirY;
    // Rotate paddle when moving left and right
    paddle1.rotation.x = -paddle1.position.y * deg90/(fieldHeight/2);
}

// Handles camera and lighting logic
function cameraPhysics() {
    // we can easily notice shadows if we dynamically move lights during the game
    spotLight.position.x = ball.position.x * 2;
    spotLight.position.y = ball.position.y * 2;

    // move to behind the player's paddle
    camera.position.x = paddle1.position.x - 120;
    camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
    camera.position.z = 30 + 100 + 0.04 * (-ball.position.x + paddle1.position.x);

    // rotate to face towards the opponent
    camera.rotation.x = -0.01 * (ball.position.y) * Math.PI / 180;
    camera.rotation.y = -60 * Math.PI / 180;
    camera.rotation.z = -90 * Math.PI / 180;
}

// Handles paddle collision logic
function paddlePhysics() {
    var currBallX = ball.position.x, nextBallX = currBallX + ballDirX * ballSpeed;

    // PLAYER PADDLE LOGIC
    // if ball is aligned with paddle1 on x plane
    var playerFrontOfThePaddle = paddle1.position.x + paddleThickness/2;
    if (currBallX >= playerFrontOfThePaddle && nextBallX <= playerFrontOfThePaddle) {
        // and if ball is aligned with paddle1 on y plane
        if (ball.position.y <= paddle1.position.y + paddleRadius
            && ball.position.y >= paddle1.position.y - paddleRadius) {
            // and if ball is travelling towards player (-ve direction)
            if (ballDirX < 0) {
                // switch direction of ball travel to create bounce
                ballDirX = -ballDirX;

                ballDirZ = -(ball.position.z * 0.018) + 3;
                ballDirX = Math.sign(ballDirX) * (hitStr + Math.random() * hitStr / 2 + Math.abs(paddle1DirY) / 8); // Y dir because side hits need to be strongr
                ballDirY = paddle1DirY * 0.5 * (0.5 + Math.random());
                ballDirY *= (0.5 + Math.random());

                //play hit ball sound
                var rnd = Math.floor(Math.random() * 5);
                Sound.playStaticSound(Sound["paddle" + rnd], 0.6 + Math.random() * 0.4);

                if (isSpacePressed) {
                    ballDirX *= 1.5;
                    ballDirZ *= 0.5
                }
            }
        }
    }

    // OPPONENT PADDLE LOGIC

    // if ball is aligned with paddle2 on x plane
    // we only check between the front and the middle of the paddle (one-way collision)
    var opponentFrontOfThePaddle = paddle2.position.x + paddleThickness/2;
    if (currBallX <= opponentFrontOfThePaddle && nextBallX >= opponentFrontOfThePaddle) {
        // and if ball is aligned with paddle2 on y plane
        if (ball.position.y <= paddle2.position.y + paddleRadius
            && ball.position.y >= paddle2.position.y - paddleRadius) {
            if (ballDirX > 0) {
                //play hit ball sound
                var rnd = Math.floor(Math.random() * 5);
                Sound.playStaticSound(Sound["paddle" + rnd], 0.6 + Math.random() * 0.4);

                // switch direction of ball travel to create bounce
                ballDirX = -ballDirX;

                ballDirZ = -(ball.position.z * 0.018) + 3;
                ballDirX = Math.sign(ballDirX) * (hitStr + Math.random() * hitStr / 2);

                if (Math.floor(Math.random() * 2) % 2 == 0) {
                    //close corner
                    ballDirY = Math.sign(paddle2.position.y + 0.01) * (fieldHeight / 2 - Math.abs(paddle2.position.y)) / fieldWidth;
                }
                else {
                    //far corner
                    ballDirY = -Math.sign(paddle2.position.y + 0.01) * (fieldHeight / 2 + Math.abs(paddle2.position.y)) / fieldWidth;
                }

                ballDirY *= (Math.random() * 3);
            }
        }
    }
}

function resetBall(loser) {
    // position the ball in the center of the table
    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = 30;

    startTimer = GAME_START_TIME;

    // if player lost the last point, we send the ball to opponent
    if (loser == 1) {
        ballDirX = -ballInitX;
    }
    // else if opponent lost, we send ball to player
    else {
        ballDirX = ballInitX;
    }

    // set the ball to move +ve in y plane (towards left from the camera)
    ballDirY = ballInitY;
    ballDirZ = ballInitZ;
}

function matchScoreCheck() {
    if (score1 >= maxScore) {
        // stop the ball
        ballSpeed = 0;
        // write to the banner
        document.getElementById("scores").innerHTML = "Player wins!";
        gameOver = true;
    }
    else if (score2 >= maxScore) {
        // stop the ball
        ballSpeed = 0;
        // write to the banner
        document.getElementById("scores").innerHTML = "CPU wins!";
        gameOver = true;
    }
}

function cpuScores() {
// CPU scores
    score2++;
    // update scoreboard HTML
    document.getElementById("scores").innerHTML = score1 + "-" + score2;
    // reset ball to center
    resetBall(2);
    matchScoreCheck();
}

function playerScores() {
// Player scores
    score1++;
    // update scoreboard HTML
    document.getElementById("scores").innerHTML = score1 + "-" + score2;
    // reset ball to center
    resetBall(1);
    matchScoreCheck();
}

