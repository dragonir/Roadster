import './style.css'
import * as THREE from 'three'
import * as CANNON from 'cannon'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Car from './car';
import CannonHelper from './cannonhelper';

var scene, camera, renderer, world, helper, vehicle, light, chassis, controls;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x12293d );
  
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.set(10, 10, 10);
  
  const ambient = new THREE.AmbientLight(0xFFFFFF, 0.3);
  scene.add(ambient);


  light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(1,1.25,1.25);
  light.castShadow = true;
  const size = 15;
  light.shadow.left = -size;
  light.shadow.bottom = -size;
  light.shadow.right = size;
  light.shadow.top = size;
  scene.add(light);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  controls = new OrbitControls(camera, renderer.domElement);
  
  initPhysics();
  
  onWindowResize();

  window.addEventListener( 'resize', onWindowResize, false );
  
  update();
}

function initPhysics(){
    
    world = new CANNON.World();
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
    new Car(scene, world, wheelMaterial, groundMaterial);
    
    const hfShape = new CANNON.Plane();
    const hfBody = new CANNON.Body({ mass: 0 });
    hfBody.addShape(hfShape);
    hfBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
    world.add(hfBody);
    helper.addVisual(hfBody, 0x12293d, 'landscape');
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