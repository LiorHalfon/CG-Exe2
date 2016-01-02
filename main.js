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

var net = initNet();
var points = 0;

initWalls();
var balls = initBalls();

var ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

initSpotLights();
document.onkeydown = handleKeyDown;

camera.position.set(0, -50, 100);
camera.lookAt(new THREE.Vector3(0,50,-100));

render();

function render() {
	requestAnimationFrame( render );

	balls.forEach(handleBallMovement);

	renderer.render( scene, camera );
}

// Check whether the key is an arrow
// If so, make sure the net is still in the box after movement
// Then move the net
function handleKeyDown(event) {
	// Left arrow pressed
	if(event.keyCode == 37){
		if(net.position.x - 2 > (-(ARENA_WIDTH/2) + WALL_THICKNESS)) {
			net.position.x -= 1;
		}
	}

	// Up arrow pressed
	if(event.keyCode == 38){
		if(net.position.y + 2 < (ARENA_HEIGHT/2 - WALL_THICKNESS)) {
			net.position.y += 1;
		}
	}

	// Right arrow pressed
	if(event.keyCode == 39){
		if(net.position.x + 2 < (ARENA_WIDTH/2 - WALL_THICKNESS)) {
			net.position.x += 1;
		}
	}

	// Down arrow pressed
	if(event.keyCode == 40){
		if(net.position.y - 2 > (-ARENA_HEIGHT/2 + WALL_THICKNESS)) {
			net.position.y -= 1;
		}
	}
}

function initNet() {
	var netGeo = new THREE.BoxGeometry(10, 10, 1);
	var netMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaff, specular: 0x009900, shininess: 0.5,
		shading: THREE.SmoothShading } );
	var mesh = new THREE.Mesh(netGeo, netMaterial);
	scene.add(mesh);
	return mesh;
	/*var net = new Net();
	scene.add(net.getMesh());*/
	//return net;
}

function initNet1() {
	var netGeo = new THREE.BoxGeometry(10, 10, 1);
	var netTexture = new THREE.TextureLoader().load(
			//url to img:
			"resources/net2.png",

			//When finshed loading:
			function ( texture ) {
				var netMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, map: texture});
				var net = new THREE.Mesh(netGeo, netMaterial);
				scene.add(net);
			}
	);
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
	scene.add(ball.getMesh());
	ball.setX((Math.random() * ARENA_WIDTH) - ARENA_WIDTH  / 2);
	ball.setY((Math.random() * ARENA_HEIGHT) - ARENA_HEIGHT / 2);
	return ball;
}

function handleBallMovement(element, index, array) {
	var ballsSpeed = 0.5;
	var mesh = element.getMesh();
	var headingAngle = normalizeAngle(element.heading);
	var ballRadius = element.ballRadius;

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
	mesh.position.x += Math.cos(Math.PI/2 - headingAngle)* ballsSpeed;
	mesh.position.y += Math.sin(Math.PI/2 - headingAngle)* ballsSpeed;

	// Check whether ball and net are in the same location
	if(mesh.position.x <= (net.position.x + ballRadius) &&
	   mesh.position.x >= (net.position.x - ballRadius) &&
	   mesh.position.y >= (net.position.y - ballRadius) &&
	   mesh.position.y <= (net.position.y + ballRadius)){
		element.sphereMaterial.color = 0x000000;
		// Tried to remove the ball from the screen like that, didnt work
		/*array.remove(element);
		scene.remove(element);*/

		// Raise Points
		points += element.gamePoints;
		//$("test").text = points.toString();
	}
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
	spotLight1.position.set(ARENA_WIDTH / 2, -ARENA_HEIGHT / 2, 20);
	spotLight1.castShadow = true;
	spotLight1.distance = 200;
	spotLight1.lookAt(-100, 1, -1);
	scene.add(spotLight1);

	var spotLight2 = spotLight1.clone();
	spotLight2.position.set(-ARENA_WIDTH / 2, -ARENA_HEIGHT / 2, 20);
	spotLight2.lookAt(100, 1, -1);
	scene.add(spotLight2);
}