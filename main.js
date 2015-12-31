var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize( window.innerWidth - 5, window.innerHeight - 5);
document.body.appendChild( renderer.domElement );
renderer.setClearColor( 0xffffff, 0);

var ARENA_WIDTH = 160;
var ARENA_HEIGHT = 80;
var BALLS_NUM = 10;

initNet();
initWalls();
var balls = new Array();
for (var i=0 ; i < BALLS_NUM ; i++){
	balls.push(createBallAtRandLocation());
}

var ambientLight = new THREE.AmbientLight(0xacacac);
scene.add(ambientLight);

var spotLight = new THREE.SpotLight(0xffffff);
spotLight.intensity = 0.4;
spotLight.position.set(0, -50, 100);
spotLight.castShadow = true;
spotLight.lookAt(0,50,-100);
scene.add(spotLight);

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 100;
camera.lookAt(new THREE.Vector3(0, 0, 1));

render();

function render() {
	requestAnimationFrame( render );

	balls.forEach(handleBallMovement);

	renderer.render( scene, camera );
}

function initNet() {
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
	var SIDE_WALL_SIZE = ARENA_HEIGHT*2;
	var TOP_WALL_SIZE = ARENA_WIDTH*2;

	var wallTexture = new THREE.TextureLoader().load(
			'resources/walls.jpg',
			function ( texture ) {
				var wallMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, map: texture});

				var sideWallGeo = new THREE.BoxGeometry(SIDE_WALL_SIZE, SIDE_WALL_SIZE , 1);
				var topWallGeo = new THREE.BoxGeometry(TOP_WALL_SIZE, TOP_WALL_SIZE , 1);

				var rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
				var leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);

				scene.add(rightWall);
				scene.add(leftWall);

				rightWall.position.x = ARENA_WIDTH/2 + SIDE_WALL_SIZE/2;
				leftWall.position.x = -(ARENA_WIDTH/2 + SIDE_WALL_SIZE/2);

				var topWall = new THREE.Mesh(topWallGeo, wallMaterial);
				var bottomWall = new THREE.Mesh(topWallGeo, wallMaterial);

				scene.add(topWall);
				scene.add(bottomWall);

				topWall.position.y = ARENA_HEIGHT/2 + TOP_WALL_SIZE/2;
				bottomWall.position.y = -(ARENA_HEIGHT/2 + TOP_WALL_SIZE/2);
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}

	);

}

function createBallAtRandLocation() {
	var ball = new Ball();
	scene.add(ball.getMesh());
	ball.setX((Math.random() * ARENA_WIDTH) - ARENA_WIDTH  / 2);
	ball.setY((Math.random() * ARENA_HEIGHT) - ARENA_HEIGHT / 2);
	return ball
}

function handleBallMovement(element, index, array) {
	var ballsSpeed = 0.5;
	var mesh = element.getMesh();
	var headingAngle = normalizeAngle(element.heading);
	var ballRadius = element.ballRadius;

	if (mesh.position.x + ballRadius > ARENA_WIDTH/2 && isHeadingRight(headingAngle) == true) {
		headingAngle = Math.random() * Math.PI + Math.PI;
	}
	else if (mesh.position.x - ballRadius < -(ARENA_WIDTH/2) && isHeadingRight(headingAngle) == false){
		headingAngle = Math.random() * Math.PI;
	}
	else if (mesh.position.y + ballRadius > ARENA_HEIGHT/2 && isHeadingUp(headingAngle) == true){
		headingAngle = Math.random() * Math.PI + Math.PI/2;
	}
	else if (mesh.position.y - ballRadius < -(ARENA_HEIGHT/2) && isHeadingUp(headingAngle) == false){
		headingAngle = Math.random() * Math.PI + Math.PI*3/2;
	}

	element.heading = headingAngle;
	mesh.position.x += Math.cos(Math.PI/2 - headingAngle)* ballsSpeed;
	mesh.position.y += Math.sin(Math.PI/2 - headingAngle)* ballsSpeed;
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