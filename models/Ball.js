function Ball() {
    this.sphereGeo = new THREE.SphereGeometry(3);
    this.sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xaaddff, specular: 0x009900, shininess: 5, shading: THREE.PCFSoftShadowMap } );
    this.mesh = new THREE.Mesh( this.sphereGeo, this.sphereMaterial );
    this.heading = Math.random()*(2*Math.PI);

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