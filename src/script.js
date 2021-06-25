import './style.css'
import * as THREE from 'three'
import * as CANNON from 'cannon'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Car from './js/world/car';
import Buildings from './js/world/buildings';
import Camera from './js/world/camera';
import CannonHelper from './js/lib/cannonhelper';
import gsap from 'gsap';

var scene, camera, renderer, world, helper, car, light;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x6e8db9 );
  
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.set(10, 10, 10);
  
  const ambient = new THREE.AmbientLight(0xFFFFFF, 0.6);
  scene.add(ambient);


  light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(1,2,1);
  light.castShadow = true;
  
  light.shadow.mapSize.width = 1000;
  light.shadow.mapSize.height = 1000;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 1000;
  light.shadow.camera = new THREE.OrthographicCamera( -100, 100, 100, -100, 0.5, 5000 );
  light.shadow.radius = 5;
  scene.add(light);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild( renderer.domElement );

  // new OrbitControls(camera, renderer.domElement);
  
  initPhysics();
  
  onWindowResize();

  window.addEventListener( 'resize', onWindowResize, false );
  
  update();
}

function initPhysics(){
    
    world = new CANNON.World();
    world.broadphase = new CANNON.SAPBroadphase(world);
    helper = new CannonHelper( scene, world );    
    
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.gravity.set(0, -10, 0);
    world.defaultContactMaterial.friction = 0;
    
    const groundMaterial = new CANNON.Material("groundMaterial");
    const wheelMaterial = new CANNON.Material("wheelMaterial");
    const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 4,
        restitution: 1,
        contactEquationStiffness: 1000
    });
    
    // We must add the contact materials to the world
    world.addContactMaterial(wheelGroundContactMaterial);
    car = new Car(scene, world);
    new Buildings(scene, world);
    new Camera(scene, world, car, camera);
    
    const hfShape = new CANNON.Plane();
    const hfBody = new CANNON.Body({ mass: 0 });
    hfBody.addShape(hfShape);
    hfBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
    world.add(hfBody);
    const floorGeo = new THREE.PlaneBufferGeometry(10000,10000);
    const floorMat = new THREE.MeshStandardMaterial({color: 0x999999});
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor); 
}       
    

function onWindowResize( event ) {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  world.step(1/60);
  helper.update();
  renderer.render( scene, camera );
}