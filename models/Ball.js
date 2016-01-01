function Ball() {
    this.ballRadius = 3;
    this.sphereGeo = new THREE.SphereGeometry(this.ballRadius);
    this.sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xaaddff, specular: 0x009900, shininess: 0.5, shading: THREE.SmoothShading } );
    this.mesh = new THREE.Mesh( this.sphereGeo, this.sphereMaterial );
    this.heading = Math.random()*(2*Math.PI);
    this.mesh.position.z = this.ballRadius/2;

    Ball.prototype.getMesh = function() {
        return this.mesh;
    };

    Ball.prototype.setX = function(x) {
        this.mesh.position.x = x;
    }

    Ball.prototype.setY = function(y) {
        this.mesh.position.y = y;
    }

    return this;
}