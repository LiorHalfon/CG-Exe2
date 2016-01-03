function Net() {
    this.netWidth = 10;
    this.netHeight = 10;
    this.netGeo = new THREE.BoxGeometry(this.netWidth, this.netHeight, 10);
    this.netMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaff, specular: 0x00aaff, shininess: 0.1,
        shading: THREE.SmoothShading } );
    this.mesh = new THREE.Mesh(this.netGeo, this.netMaterial);
    this.step = 1;

    Net.prototype.getMesh = function() {
        return this.mesh;
    };

    Net.prototype.getWidth = function(){
        return this.netWidth;
    };

    return this;
}
