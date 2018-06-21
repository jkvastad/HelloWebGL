const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');

var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;

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
    camera: new THREE.OrthographicCamera(-10,10,10,-10,0.1,100)
}];

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const controls = new OrbitControls(views[0].camera);

const helper1 = new THREE.CameraHelper(views[0].camera);
const helper2 = new THREE.CameraHelper(views[1].camera);
//scene.add(helper1);
scene.add(helper2);

function init(){    
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
    controls.update();
    requestAnimationFrame( animate );
}

init();
animate();