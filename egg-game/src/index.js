const THREE = require('three');
global.THREE = THREE; //three examples sometimes require global THREE object
require('three/examples/js/controls/OrbitControls');
require('three/examples/js/geometries/DecalGeometry');

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color( 0xff0000 ),1);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


function createEgg(color){
var points = [];
for (var deg = 0; deg <= 180; deg += 6) {
    var rad = Math.PI * deg / 180;
    var point = new THREE.Vector2((0.72 + .08 * Math.cos(rad)) * Math.sin(rad), - Math.cos(rad)); // the "egg equation"
    //console.log( point ); // x-coord should be greater than zero to avoid degenerate triangles; it is not in this formula.
    points.push(point);

}
var eggGeometry = new THREE.LatheBufferGeometry(points, 32);
var eggMaterial = new THREE.MeshPhongMaterial( { color: color } );
return new THREE.Mesh(eggGeometry, eggMaterial);
}
var egg = createEgg(Math.random() * 0xffffff);
scene.add(egg);

scene.add( new THREE.AmbientLight( 0x443333 ) );
var light = new THREE.DirectionalLight( 0xffddcc, 1 );
light.position.set( 1, 0.75, 0.5 );
scene.add( light );
var light = new THREE.DirectionalLight( 0xccccff, 1 );
light.position.set( -1, 0.75, -0.5 );
scene.add( light );

var mainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var controls = new THREE.OrbitControls(mainCamera);

var decalProjector = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1), new THREE.MeshNormalMaterial());
decalProjector.visible = false;
scene.add(decalProjector);

var geometry = new THREE.BufferGeometry();
geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );
normalLine = new THREE.Line( geometry, new THREE.LineBasicMaterial( { linewidth: 4 } ) );
scene.add( normalLine );

var decals = [];
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


function addDecal(){
    let decal = new THREE.Mesh(new THREE.DecalGeometry(egg,decalProjector.position,decalProjector.rotation,
        new THREE.Vector3(1,1,1)), decalMaterial);
    decals.push(decal);
    scene.add(decal);
}

function removeDecal(){
    if (decals.length > 0) {
        scene.remove(decals.pop());   
    }    
}

function removeAllDecals(){
    while (decals.length > 0) {
        removeDecal();            
    }
}

window.addEventListener('mousemove', onMouseMove);
var mouse = new THREE.Vector2();
function onMouseMove(event){
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    updateIntersection();    
}

var raycaster = new THREE.Raycaster();
var eggIntersections;
function updateIntersection(){        
    raycaster.setFromCamera(mouse,mainCamera);
    eggIntersections = raycaster.intersectObject(egg);
    if(eggIntersections.length > 0){
        let intersectionPoint = eggIntersections[0].point;        
        let surfaceNormal = eggIntersections[0].face.normal.clone();
        surfaceNormal.transformDirection(egg.matrixWorld);        
        surfaceNormal.add(intersectionPoint);
        
        decalProjector.position.copy(intersectionPoint);
        decalProjector.lookAt(surfaceNormal);
        
        normalLine.geometry.attributes.position.setXYZ( 0, intersectionPoint.x, intersectionPoint.y, intersectionPoint.z );
        normalLine.geometry.attributes.position.setXYZ( 1, surfaceNormal.x, surfaceNormal.y, surfaceNormal.z );
        normalLine.geometry.attributes.position.needsUpdate = true;
    }
}

window.addEventListener("mousedown",crackEgg);
function crackEgg(){
    updateIntersection();
    if(eggIntersections.length > 0) addDecal();
}

window.addEventListener("keyup", keyUpEvents);
function keyUpEvents(event){
    var alias = {
        "w" : 87
    };        
    if (event.keyCode == alias["w"]) {
        removeDecal();
    }
};

function render(){                  
    renderer.render( scene, mainCamera );	
}

function init(){
    egg.position.set(0, 0, 0);
    mainCamera.position.z = 5;    
}

function animate() {        
    updateGameState();
    controls.update();    
    render();
    requestAnimationFrame( animate );
}

function updateGameState(){
    if(decals.length > 2){
        removeAllDecals();
        scene.remove(egg);
        egg = createEgg(Math.random() * 0xffffff);    
        scene.add(egg);
    }
}

init();
animate();