function Net() {
    this.netGeo = new THREE.BoxGeometry(10, 10, 1);
    this.netMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaff, specular: 0x009900, shininess: 0.5,
        shading: THREE.SmoothShading } );
    this.mesh = new THREE.Mesh(this.netGeo, this.netMaterial);

    /*this.heading = Math.random()*(2*Math.PI);
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;*/

    Net.prototype.getMesh = function() {
        return this.mesh;
    };

    /*Net.prototype.setX = function(x) {
        this.mesh.position.x = x;
    }

    Net.prototype.setY = function(y) {
        this.mesh.position.y = y;
    }*/

    return this;
}
