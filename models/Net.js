function Net() {
    this.netGeo = new THREE.BoxGeometry(10, 10, 1);
    this.netMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaff, specular: 0x009900, shininess: 0.5,
        shading: THREE.SmoothShading } );
    this.mesh = new THREE.Mesh(this.netGeo, this.netMaterial);

    Net.prototype.getMesh = function() {
        return this.mesh;
    };

    return this;
}
