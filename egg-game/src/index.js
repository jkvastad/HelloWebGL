const THREE = require('three');
global.THREE = THREE; //three examples sometimes require global THREE object
require('three/examples/js/controls/OrbitControls');
require('three/examples/js/geometries/DecalGeometry');

var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;

var decals = [];

var scene = new THREE.Scene();
var views= [{
    left: 0,
    top: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color( 0.5, 0.5, 0.7 ),
    camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
},{
    left: 0.5,
    top: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color( 0.0, 0.0, 0.0 ),
    camera: new THREE.OrthographicCamera(-0.1,0.1,0.1,-0.1,0.1,1)
}];

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var texture = new THREE.TextureLoader().load('textures/crate.gif');
var material = new THREE.MeshBasicMaterial( { map: texture } );
var decalDiffuse = new THREE.TextureLoader().load('textures/decal-diffuse.png');
var decalNormal = new THREE.TextureLoader().load('textures/decal-normal.jpg');
var decalMaterial = new THREE.MeshPhongMaterial( {
    specular: 0x444444,
    map: decalDiffuse,
    normalMap: decalNormal,
    normalScale: new THREE.Vector2( 1, 1 ),
    shininess: 30,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: - 4,
    wireframe: false
} );
decalMaterial.color.setHex(0xff69b4);

var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

scene.add( new THREE.AmbientLight( 0x443333 ) );

var light = new THREE.DirectionalLight( 0xffddcc, 1 );
light.position.set( 1, 0.75, 0.5 );
scene.add( light );

var light = new THREE.DirectionalLight( 0xccccff, 1 );
light.position.set( -1, 0.75, -0.5 );
scene.add( light );

var mainCamera = views[0].camera;
var projector = views[1].camera;

var currentControls;
var controls = [];

window.addEventListener("keyup", keyUpEvents);

const helper1 = new THREE.CameraHelper(mainCamera);
const helper2 = new THREE.CameraHelper(projector);
//scene.add(helper1);
scene.add(helper2);

init();
animate();

function addDecal(){
    let decal = new THREE.Mesh(new THREE.DecalGeometry(cube,projector.position,projector.rotation,
        new THREE.Vector3(projector.right - projector.left,projector.top - projector.bottom, projector.far - projector.near)), decalMaterial);
    decals.push(decal);
    scene.add(decal);
}

function removeDecal(){
    if (decals.length > 0) {
        scene.remove(decals.pop());   
    }    
}

function keyUpEvents(event){
    var alias = {
        "q" : 81,
        "w" : 87,
        "1" : 49,
        "2" : 50
    };    
    if (event.keyCode == alias["q"]) {
        addDecal();
    }
    if (event.keyCode == alias["w"]) {
        removeDecal();
    }
    if (event.keyCode == alias["1"]) {
        switchCameraControls(0);
    }
    if (event.keyCode == alias["2"]) {
        switchCameraControls(1);
    }
};

function switchCameraControls(cameraNumber){
    if (cameraNumber < controls.length){
        currentControls.enabled = false;
        currentControls = controls[cameraNumber];
        currentControls.enabled = true;
    }
}

function init(){
    controls = [new THREE.OrbitControls(mainCamera),new THREE.OrbitControls(projector)];
    controls[1].enabled = false;
    currentControls = controls[0];
    views[0].camera.position.z = 5;    
    views[1].camera.position.z = 5;    
}

function render(){
    for(let i = 0; i < views.length; i++){
        let view = views[i];
        let camera = view.camera;
        let left   = Math.floor( windowWidth  * view.left );
        let top    = Math.floor( windowHeight * view.top );
        let width  = Math.floor( windowWidth  * view.width );
        let height = Math.floor( windowHeight * view.height );                
                
        renderer.setViewport(left, top, width, height);
        renderer.setScissor( left, top, width, height );
        renderer.setScissorTest( true );
        renderer.setClearColor(view.background);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render( scene, camera );	
    }	
}

function animate() {    
    render();
    currentControls.update();
    requestAnimationFrame( animate );
}