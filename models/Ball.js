function Ball() {
    // Default values - will change for each ball type
    this.radius = 3;
    this.gamePoints = 10;
    this.speed = 0.5;
    this.type = "Default"; //Types: Red, Yellow, Blue
    this.color = 0xaaddff;
    this.maxSpeed = 1;
    this.amountOfRounds = 100;
    ///////////////////////

    this.mesh;
    this.heading = Math.random()*(2*Math.PI);



    Ball.prototype.createBall = function() {
        var sphereGeo = new THREE.SphereGeometry(this.radius);
        var sphereMaterial = new THREE.MeshPhongMaterial( { color: this.color, specular: 0x009900, shininess: 0.5, shading: THREE.SmoothShading } );
        this.mesh = new THREE.Mesh( sphereGeo, sphereMaterial );

        // Set Height to be on the floor
        this.mesh.position.z = this.radius/2;
    }

    Ball.prototype.getMesh = function() {
        return this.mesh;
    };

    Ball.prototype.setX = function(x) {
        this.mesh.position.x = x;
    };

    Ball.prototype.setY = function(y) {
        this.mesh.position.y = y;
    };

    return this;
}