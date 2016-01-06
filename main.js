var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize( window.innerWidth - 5, window.innerHeight - 5);
document.body.appendChild( renderer.domElement );
renderer.setClearColor( 0xffffff, 0);

var ARENA_WIDTH = 160;
var ARENA_HEIGHT = 80;
var BALLS_NUM = 10;
var WALL_THICKNESS = 3;
var SPEED_BOOST = 0.001;

var player = initPlayer();
var points = 0;

initWalls();
var balls = initBalls();

var ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

initSpotLights();
document.onkeydown = handleKeyDown;

camera.position.set(0, -50, 100);
camera.lookAt(new THREE.Vector3(0,50,-100));

var pointsLabel = createPointsTextLabel();

render();

function render() {
	requestAnimationFrame( render );

	balls.forEach(handleBallMovement);

	renderer.render( scene, camera );
}

// Check whether the key is an arrow
// If so, make sure the player is still in the box after movement
// Then move the player
function handleKeyDown(event) {
	// Left arrow pressed
	if(event.keyCode == 37){
		if(player.getMesh().position.x - 2 > (-(ARENA_WIDTH/2) + WALL_THICKNESS)) {
			player.getMesh().position.x -= player.step;
		}
	}

	// Up arrow pressed
	if(event.keyCode == 38){
		if(player.getMesh().position.y + 2 < (ARENA_HEIGHT/2 - WALL_THICKNESS)) {
			player.getMesh().position.y += player.step;
		}
	}

	// Right arrow pressed
	if(event.keyCode == 39){
		if(player.getMesh().position.x + 2 < (ARENA_WIDTH/2 - WALL_THICKNESS)) {
			player.getMesh().position.x += player.step;
		}
	}

	// Down arrow pressed
	if(event.keyCode == 40){
		if(player.getMesh().position.y - 2 > (-ARENA_HEIGHT/2 + WALL_THICKNESS)) {
			player.getMesh().position.y -= player.step;
		}
	}
}

function initPlayer() {
	var player = new Player();
	scene.add(player.getMesh());
	return player;
}

function initWalls() {
	var WALL_HEIGHT = 15;
	var SIDE_WALL_SIZE = ARENA_HEIGHT+ WALL_THICKNESS*2;
	var TOP_WALL_SIZE = ARENA_WIDTH;


	var wallMaterial = new THREE.MeshPhongMaterial( {  color: 0xA9A9A9, shading: THREE.SmoothShading } );
	var sideWallGeo = new THREE.BoxGeometry(WALL_THICKNESS, SIDE_WALL_SIZE , WALL_HEIGHT);
	var topWallGeo = new THREE.BoxGeometry(TOP_WALL_SIZE, WALL_THICKNESS , WALL_HEIGHT);
	var rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
	var leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
	scene.add(rightWall);
	scene.add(leftWall);
	rightWall.position.x = ARENA_WIDTH/2 + WALL_THICKNESS/2;
	leftWall.position.x = -(ARENA_WIDTH/2 + WALL_THICKNESS/2);
	var topWall = new THREE.Mesh(topWallGeo, wallMaterial);
	var bottomWall = new THREE.Mesh(topWallGeo, wallMaterial);
	scene.add(topWall);
	scene.add(bottomWall);
	topWall.position.y = ARENA_HEIGHT/2 + WALL_THICKNESS/2;
	bottomWall.position.y = -(ARENA_HEIGHT/2 + WALL_THICKNESS/2);
	rightWall.position.z = WALL_HEIGHT/2;
	leftWall.position.z = WALL_HEIGHT/2;
	topWall.position.z = WALL_HEIGHT/2;
	bottomWall.position.z = WALL_HEIGHT/2;

	// Init Floor
	var floorGeo = new THREE.BoxGeometry(ARENA_WIDTH, ARENA_HEIGHT , 1);
	var floorMaterial = new THREE.MeshPhongMaterial( {  color: 0x696969, shininess: 100, shading: THREE.SmoothShading } );
	var floor = new THREE.Mesh(floorGeo, floorMaterial);
	floor.position.z = -0.5;
	scene.add(floor);
}

function initBalls(){
	var balls = new Array();
	for (var i=0 ; i < BALLS_NUM ; i++){
		balls.push(createBallAtRandLocation());
	}
	return balls;
}

function createBallAtRandLocation() {
	var ball = new Ball();

	//init the ball by a random type:
	switch (Math.floor(Math.random()*3)){
		case 0: //Red Ball
			ball.type = "Red";
			ball.speed = 1.5;
			ball.maxSpeed = 2.5;
			ball.gamePoints = 20;
			ball.radius = 1;
			ball.color = 0xD70000;
			ball.amountOfRounds = 900;
			break;
		case 1: //Yellow Ball
			ball.type = "Yellow";
			ball.speed = 1;
			ball.maxSpeed = 2;
			ball.gamePoints = 10;
			ball.radius = 3;
			ball.color = 0xFFDF00;
			ball.amountOfRounds = 1500;
			break;
		case 2: // Blue ball
		default:
			ball.type = "Blue";
			ball.speed = 0.5;
			ball.maxSpeed = 1.5;
			ball.gamePoints = 5;
			ball.radius = 5;
			ball.color = 0x8CBED6;
			ball.amountOfRounds = 2000;
			break;
	}

	ball.createBall();
	scene.add(ball.getMesh());
	ball.setX((Math.random() * ARENA_WIDTH) - ARENA_WIDTH  / 2);
	ball.setY((Math.random() * ARENA_HEIGHT) - ARENA_HEIGHT / 2);

	return ball;
}

function handleBallMovement(element, index, array) {
	var mesh = element.getMesh();
	var headingAngle = normalizeAngle(element.heading);
	var ballRadius = element.radius;

	if (mesh.position.x + ballRadius > ARENA_WIDTH/2 && isHeadingRight(headingAngle) == true) {
		headingAngle = 2*Math.PI - headingAngle;
	}
	else if (mesh.position.x - ballRadius < -(ARENA_WIDTH/2) && isHeadingRight(headingAngle) == false){
		headingAngle = 2*Math.PI - headingAngle;
	}
	else if (mesh.position.y + ballRadius > ARENA_HEIGHT/2 && isHeadingUp(headingAngle) == true){
		headingAngle = Math.PI - headingAngle;
	}
	else if (mesh.position.y - ballRadius < -(ARENA_HEIGHT/2) && isHeadingUp(headingAngle) == false){
		headingAngle = Math.PI - headingAngle;
	}

	element.heading = headingAngle;
	mesh.position.x += Math.cos(Math.PI/2 - headingAngle)* element.speed;
	mesh.position.y += Math.sin(Math.PI/2 - headingAngle)* element.speed;

	// Speed Up!
	if(element.speed < element.maxSpeed) {
		element.speed += SPEED_BOOST;
	}

	// Decrease lifetime
	element.amountOfRounds--;

	// Check whether ball and player are in the same location
	if(isBallInBox(mesh)){
		handleBallInBox(element, index, array);
	}
	// Lifetime over, remove ball without adding points
	else if(element.amountOfRounds == 0){
		disposeBall(element, index, array);
	}

	// Check end of game
	if(array.length == 0){
		pointsLabel.innerHTML = "Game Ended!! (^-^) Points: " + points.toString();
	}
}

function isBallInBox(ballMesh){
	return (ballMesh.position.x <= (player.getMesh().position.x + player.getInnerWidth()/2) &&
	        ballMesh.position.x >= (player.getMesh().position.x - player.getInnerWidth()/2) &&
        	ballMesh.position.y >= (player.getMesh().position.y - player.getInnerWidth()/2) &&
	        ballMesh.position.y <= (player.getMesh().position.y + player.getInnerWidth()/2));
}

function handleBallInBox(ball, index, array){
	disposeBall(ball, index, array);

	// Raise Points
	points += ball.gamePoints;
	pointsLabel.innerHTML = "Points: " + points.toString();
}

// Delete the ball from the balls array and from the scene
function disposeBall(ball, index, array){
	array.splice(index, 1);
	scene.remove(ball.getMesh());
}

function isHeadingUp(heading) {
	if (heading > Math.PI/2 && heading < Math.PI*3/2 )
		return false;
	else
		return true;
}

function isHeadingRight(heading) {
	if (heading < Math.PI)
		return true;
	else
		return false;
}

function normalizeAngle(angle)
{
	var newAngle = angle;
	while (newAngle < 0) newAngle += Math.PI*2;
	while (newAngle > Math.PI*2) newAngle -= Math.PI*2;
	return newAngle;
}

function initSpotLights() {
	var spotLight1 = new THREE.SpotLight(0xffffff);
	spotLight1.intensity = 1.2;
	spotLight1.position.set(ARENA_WIDTH / 2, -ARENA_HEIGHT / 2, 40);
	spotLight1.castShadow = true;
	spotLight1.distance = 200;
	spotLight1.lookAt(-ARENA_WIDTH/2,ARENA_HEIGHT/2 , 0);
	spotLight1.exponent = 6;
	scene.add(spotLight1);

	var spotLight2 = spotLight1.clone();
	spotLight2.position.set(-ARENA_WIDTH / 2, -ARENA_HEIGHT / 2, 40);
	spotLight2.lookAt(ARENA_WIDTH/2,ARENA_HEIGHT/2 , 0);
	scene.add(spotLight2);
}

function createPointsTextLabel() {
	var pointsLabel = document.createElement('div');
	pointsLabel.id = "points";
	pointsLabel.innerHTML = "Points: ";
	document.body.appendChild(pointsLabel);

	return pointsLabel;
}