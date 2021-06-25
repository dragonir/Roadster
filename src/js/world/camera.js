import gsap from 'gsap'

export default class Camera {
    constructor(scene, world, car, camera) {
        this.scene = scene;
        this.world = world;
        this.car = car;
        this.camera = camera;
        this.cameraOffset = {
            x: 4,
            y: 20,
            z: 36,
            _x: 0,
            _y: 0,
            _z: 0
        }
        this.init();
    }
    init() {
        this.updateCamera();
        window.addEventListener('mousedown', (e) => {
            
        })
        window.addEventListener('wheel', e => {
            this.camera.fov += ((e.wheelDelta < 0) ? 0.5 : -0.5);
            if(this.camera.fov < 20) {
                this.camera.fov = 20;
            }
            if(this.camera.fov > 40) {
                this.camera.fov = 40;
            }
            this.camera.updateProjectionMatrix();
        }) 
    }
    updateCamera() {
        const update = () => {
            if(this.car?.chassis?.position){
                gsap.to(this.camera.position, {
                  duration: 0,
                  x: this.car.chassis.position.x + this.cameraOffset.x, 
                  y: this.car.chassis.position.y + this.cameraOffset.y, 
                  z: this.car.chassis.position.z + this.cameraOffset.z, 
                })
                this.camera.lookAt(this.car.chassis.position)
            }
        }
        this.world.addEventListener('postStep', update);
    }
}