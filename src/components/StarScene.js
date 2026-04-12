import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export function initScene(){

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    // === СЦЕНА ===
    const scene = new THREE.Scene()
    
    
    // === КАМЕРА ===
    const camera = new THREE.PerspectiveCamera(
      75,         // угол обзора (field of view) в градусах
      window.innerWidth/window.innerHeight,     // соотношение сторон (aspect)
      0.1,        // ближняя плоскость отсечения (near)
      2000        // дальняя плоскость отсечения (far)
    )
    camera.position.z = 1000      // позиция камеры по оси Z
    
    

    // === РЕНДЕР ===
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(1)
    document.body.appendChild(renderer.domElement)

    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.xIndex = '0';
    canvas.style.pointerEvents = 'auto';

    
    // === УПРАВЛЕНИЕ КАМЕРОЙ ===
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 2
    controls.maxDistance = 1000
    controls.target.set(0, 0, 100)
    controls.update()

    // resize для изменения окна 
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(1)
    })
    
  return {scene, camera, renderer, controls};

}