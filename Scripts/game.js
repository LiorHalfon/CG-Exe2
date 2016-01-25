
// GLOBALS: ///////////////////////////////////////////////////////
// scene object variables
var renderer, scene, camera, pointLight, spotLight;

// field variables
var fieldWidth = 400, fieldHeight = 200, fieldDepth = 50;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality;
var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 5;
var isSpacePressed = false, spaceKeyTimer = 0, INITIAL_SPACE_KEY_TIME = 800;

// ball variables
var ball, paddle1, paddle2;
var ballDirX = 1, ballDirY = 0.2, ballDirZ = -0.01; ballSpeed = 5;
var TO_OPPONENT = 1;
var BALL_MAX_HEIGHT = 50, ballZSpeed = 0.15;
var ballRadius = 5;
var GAME_START_TIME=1000, startTimer= GAME_START_TIME;

// game-related variables
var score1 = 0, score2 = 0;
// you can change this to any positive whole number
var maxScore = 7;

// set opponent reflexes (1 - easiest, 5 - hardest)
var difficulty = 3.5;
////////////////////////////////////////////////////////////////////

function setup()
{
	// now reset player and opponent scores
	score1 = 0;
	score2 = 0;
	
	// set up all the 3D objects in the scene	
	createScene();
	
	// and let's get cracking!
	draw();
}

function createScene()
{
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
			map: THREE.ImageUtils.loadTexture( "textures/tennis-court.jpg" ),
		  	color: 0x777777
		});
	// create the table's material
	var tableMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x111111
		});
	// create the pillar's material
	var pillarMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x534d0d
		});
	// create the ground's material
	var groundMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x888888
		});
		
		
	// create the playing surface plane
	var plane = new THREE.Mesh(

	  new THREE.PlaneGeometry(
		planeWidth * 0.95,	// 95% of table width, since we want to show where the ball goes out-of-bounds
		planeHeight,
		planeQuality,
		planeQuality),

	  planeMaterial);
	  
	scene.add(plane);
	plane.receiveShadow = true;	
	
	var table = new THREE.Mesh(

	  new THREE.CubeGeometry(
		planeWidth * 1.05,	// this creates the feel of a billiards table, with a lining
		planeHeight * 1.03,
		100,				// an arbitrary depth, the camera can't see much of it anyway
		planeQuality,
		planeQuality,
		1),

	  tableMaterial);
	table.position.z = -51;	// we sink the table into the ground by 50 units. The extra 1 is so the plane can be seen
	scene.add(table);
	table.receiveShadow = true;	
		
	// // set up the sphere vars
	// lower 'segment' and 'ring' values will increase performance
	var radius = ballRadius,
		segments = 6,
		rings = 6;
		
	// // create the sphere's material
	var sphereMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xD43001
		});
		
	// Create a ball with sphere geometry
	ball = new THREE.Mesh(

	  new THREE.SphereGeometry(
		radius,
		segments,
		rings),

	  sphereMaterial);

	// // add the sphere to the scene
	scene.add(ball);
	
	ball.position.x = 0;
	ball.position.y = 0;
	// set ball above the table surface
	ball.position.z = radius + 20;
	ball.receiveShadow = true;
    ball.castShadow = true;
	
	// // set up the paddle vars
	paddleWidth = 10;
	paddleHeight = 30;
	paddleDepth = 10;
	paddleQuality = 1;
		
	paddle1 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle1Material);

	// // add the sphere to the scene
	scene.add(paddle1);
	paddle1.receiveShadow = true;
    paddle1.castShadow = true;
	
	paddle2 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle2Material);
	  
	// // add the sphere to the scene
	scene.add(paddle2);
	paddle2.receiveShadow = true;
    paddle2.castShadow = true;	
	
	// set paddles on each side of the table
	paddle1.position.x = -fieldWidth/2 + paddleWidth;
	paddle2.position.x = fieldWidth/2 - paddleWidth;
	
	// lift paddles over playing surface
	paddle1.position.z = 30;
	paddle2.position.z = 30;
		
	// we iterate 10x (5x each side) to create pillars to show off shadows
	// this is for the pillars on the left
	for (var i = 0; i < 5; i++)
	{
		var backdrop = new THREE.Mesh(
		
		  new THREE.CubeGeometry( 
		  30, 
		  30, 
		  300, 
		  1, 
		  1,
		  1 ),

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
	for (var i = 0; i < 5; i++)
	{
		var backdrop = new THREE.Mesh(

		  new THREE.CubeGeometry( 
		  30, 
		  30, 
		  300, 
		  1, 
		  1,
		  1 ),

		  pillarMaterial);
		  
		backdrop.position.x = -50 + i * 100;
		backdrop.position.y = -230;
		backdrop.position.z = -30;
		backdrop.castShadow = true;
		backdrop.receiveShadow = true;		
		scene.add(backdrop);	
	}
	
	// finally we finish by adding a ground plane
	// to show off pretty shadows
	var ground = new THREE.Mesh(

	  new THREE.CubeGeometry( 
	  1000, 
	  1000, 
	  3, 
	  1, 
	  1,
	  1 ),

	  groundMaterial);
    // set ground to arbitrary z position to best show off shadowing
	ground.position.z = -132;
	ground.receiveShadow = true;	
	scene.add(ground);		
		
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
	// this is important for casting shadows
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
	
	// MAGIC SHADOW CREATOR DELUXE EDITION with Lights PackTM DLC
	renderer.shadowMapEnabled = true;		
}

function draw()
{	
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

function ballPhysics()
{
	if (startTimer > 0){
		startTimer-=18;
		return;
	}

	// if ball goes off the 'left' side (Player's side)
	if (ball.position.x <= -fieldWidth/2)
	{
		cpuScores();
	}
	
	// if ball goes off the 'right' side (CPU's side)
	if (ball.position.x >= fieldWidth/2)
	{
		playerScores();
	}

	// handle ball bounce
	if (ball.position.z  - ballRadius <= 0){
		if (ball.position.y > fieldHeight/2 || ball.position.y < -fieldHeight/2)
		{
			if(ballDirX == TO_OPPONENT){
				cpuScores();
			}
			else{
				playerScores();
			}
		}

		ballDirZ = ballZSpeed*2;

	}else if(ball.position.z + ballRadius >= BALL_MAX_HEIGHT) {
		ballDirZ = -ballZSpeed;
	}

	// update ball position over time
	ball.position.x += ballDirX * ballSpeed;
	ball.position.y += ballDirY * ballSpeed;
	ball.position.z += ballDirZ * ballSpeed;

}

// Handles CPU paddle movement and logic
function opponentPaddleMovement()
{
	if (ballDirX == TO_OPPONENT){
	// Lerp towards the ball on the y plane
		paddle2DirY = Math.sign(ball.position.y - paddle2.position.y) * paddleSpeed/10 * difficulty;
	}
	else{
		paddle2DirY = 0;
	}

	if(Math.abs(ball.position.y - paddle2.position.y) <= Math.abs(paddle2DirY)) {
		paddle2DirY = (ball.position.y - paddle2.position.y);
	}

	paddle2.position.y += paddle2DirY;

	paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;	
}


// Handles player's paddle movement
function playerPaddleMovement()
{
	// move left
	if (Key.isDown(Key.A))		
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle1.position.y < fieldHeight * 0.6)
		{
			paddle1DirY = paddleSpeed * 0.5;
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle1DirY = 0;
			paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
		}
	}	
	// move right
	else if (Key.isDown(Key.D))
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle1.position.y > -fieldHeight * 0.6)
		{
			paddle1DirY = -paddleSpeed * 0.5;
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle1DirY = 0;
			paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
		}
	}
	// else don't move paddle
	else
	{
		// stop the paddle
		paddle1DirY = 0;
	}

	if(Key.isDown(Key.SPACE) && !isSpacePressed){
		isSpacePressed = true;
		spaceKeyTimer = INITIAL_SPACE_KEY_TIME;
	}

	if(isSpacePressed){
		paddle1.scale.z = 5;
		spaceKeyTimer-=16;
		if (spaceKeyTimer <= 0)
			isSpacePressed = false;
	}
	
	paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;	
	paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;	
	paddle1.position.y += paddle1DirY;
}

// Handles camera and lighting logic
function cameraPhysics()
{
	// we can easily notice shadows if we dynamically move lights during the game
	spotLight.position.x = ball.position.x * 2;
	spotLight.position.y = ball.position.y * 2;
	
	// move to behind the player's paddle
	camera.position.x = paddle1.position.x - 100;
	camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
	camera.position.z = paddle1.position.z + 100 + 0.04 * (-ball.position.x + paddle1.position.x);
	
	// rotate to face towards the opponent
	camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	camera.rotation.y = -60 * Math.PI/180;
	camera.rotation.z = -90 * Math.PI/180;
}

// Handles paddle collision logic
function paddlePhysics()
{
	// PLAYER PADDLE LOGIC
	
	// if ball is aligned with paddle1 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.x <= paddle1.position.x + paddleWidth
	&&  ball.position.x >= paddle1.position.x)
	{
		// and if ball is aligned with paddle1 on y plane
		if (ball.position.y <= paddle1.position.y + paddleHeight/2
		&&  ball.position.y >= paddle1.position.y - paddleHeight/2)
		{
			// and if ball is travelling towards player (-ve direction)
			if (ballDirX < 0)
			{
				ball.position.z = BALL_MAX_HEIGHT;
				ballDirZ = -ballZSpeed;

				// switch direction of ball travel to create bounce
				ballDirX = -ballDirX;

				if (isSpacePressed){
					// close corner
					ballDirY = Math.sign(paddle1.position.y+0.01)*( fieldHeight/2 - Math.abs(paddle1.position.y)) / fieldWidth;
					//far corner
					ballDirY = -Math.sign(paddle1.position.y+0.01)*(Math.abs(paddle1.position.y) + fieldHeight/2) / fieldWidth;
				}
				else{
					ballDirY = paddle1DirY * 0.1;
				}
			}
		}
	}
	
	// OPPONENT PADDLE LOGIC	

	// if ball is aligned with paddle2 on x plane
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.x <= paddle2.position.x + paddleWidth
	&&  ball.position.x >= paddle2.position.x)
	{
		// and if ball is aligned with paddle2 on y plane
		if (ball.position.y <= paddle2.position.y + paddleHeight/2
		&&  ball.position.y >= paddle2.position.y - paddleHeight/2)
		{
			if (ballDirX == TO_OPPONENT)
			{
				ball.position.z = BALL_MAX_HEIGHT;
				ballDirZ = -ballZSpeed;

				// switch direction of ball travel to create bounce
				ballDirX = -ballDirX;

				if (Math.round(Math.random()*100) % 2 == 0){
					//close corner
					ballDirY = Math.sign(paddle2.position.y+0.01)*( fieldHeight/2 - Math.abs(paddle2.position.y)-5) / fieldWidth;
				}
				else{
					//far corner
					ballDirY = -Math.sign(paddle2.position.y+0.01)*(Math.abs(paddle2.position.y) +fieldHeight/2 - 5) / fieldWidth;
				}
			}
		}
	}
}

function resetBall(loser)
{
	// position the ball in the center of the table
	ball.position.x = 0;
	ball.position.y = 0;

	startTimer = GAME_START_TIME;
	
	// if player lost the last point, we send the ball to opponent
	if (loser == 1)
	{
		ballDirX = -1;
	}
	// else if opponent lost, we send ball to player
	else
	{
		ballDirX = 1;
	}
	
	// set the ball to move +ve in y plane (towards left from the camera)
	ballDirY = 0;
}

function matchScoreCheck()
{
	if (score1 >= maxScore)
	{
		// stop the ball
		ballSpeed = 0;
		// write to the banner
		document.getElementById("scores").innerHTML = "Player wins!";
	}
	else if (score2 >= maxScore)
	{
		// stop the ball
		ballSpeed = 0;
		// write to the banner
		document.getElementById("scores").innerHTML = "CPU wins!";
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