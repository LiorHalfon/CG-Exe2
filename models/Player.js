function Player() {
    //Build Outer Box
    this.outerBoxWidth = 10;
    this.outerBoxGeo = new THREE.BoxGeometry(this.outerBoxWidth, this.outerBoxWidth, 1);
    this.outerBoxMaterial = new THREE.MeshPhongMaterial({color: 0xa58d5f, specular: 0x00aaff, shininess: 0.1,
        shading: THREE.SmoothShading } );
    this.outerBoxMesh = new THREE.Mesh(this.outerBoxGeo, this.outerBoxMaterial);

    //Build Inner Box
    this.innerBoxWidth = this.outerBoxWidth - 1;
    this.innerBoxGeo = new THREE.BoxGeometry(this.innerBoxWidth, this.innerBoxWidth, 1.1);
    this.innerBoxMaterial = new THREE.MeshPhongMaterial({color: 0x2c2c2c, shininess: 0,
        shading: THREE.SmoothShading } );
    this.innerBoxMesh = new THREE.Mesh(this.innerBoxGeo, this.innerBoxMaterial);

    this.group = new THREE.Group();
    this.group.add( this.outerBoxMesh );
    this.group.add( this.innerBoxMesh );

    this.step = 1;

    Player.prototype.getMesh = function() {
        return this.group;
    };

    Player.prototype.getInnerWidth = function(){
        return this.innerBoxWidth;
    };

    Player.prototype.getPosition = function(){
        return this.group.position;
    }

    return this;
}
