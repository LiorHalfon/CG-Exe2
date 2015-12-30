var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ alpha: true, logarithmicDepthBuffer: true });

renderer.setSize( window.innerWidth - 5, window.innerHeight - 5);
document.body.appendChild( renderer.domElement );
renderer.setClearColor( 0xffffff, 0);

initNet();
createBall();

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

var ARENA_WIDTH = 160;
var ARENA_HEIGHT = 80;


initWalls();

render();

function render() {
	requestAnimationFrame( render );
	
	renderer.render( scene, camera );
}

function initNet() {
	var netGeo = new THREE.BoxGeometry(10, 10, 1);
	var netTexture = new THREE.TextureLoader().load("resources/net2.png");
	var netMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, map: netTexture});
	var net = new THREE.Mesh(netGeo, netMaterial);
	scene.add(net);
}

function initWalls() {
	var SIDE_WALL_SIZE = ARENA_HEIGHT*2;
	var TOP_WALL_SIZE = ARENA_WIDTH*2;

	var wallTexture = new THREE.TextureLoader().load("resources/wood_background.jpg");
	var wallMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, map: wallTexture});

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
}

function createBall() {
	var ball = new Ball();
	scene.add( ball.GetMesh() );
	ball.setX(10);
	ball.setY(10);
}