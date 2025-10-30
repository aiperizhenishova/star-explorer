import * as THREE from 'three'


//сцена
const scene = new THREE.Scene()

//камера
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  2000
)
camera.position.z = 150


//рендер
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)


//объект
const geometry = new THREE.SphereGeometry(1, 32, 32)
const material = new THREE.MeshBasicMaterial({color: 0xffff00})
const star = new THREE.Mesh(geometry, material)
scene.add(star)

//функция для постоянного рендера и анимации
function animate(){
  requestAnimationFrame(animate)

  star.rotation.y += 0.01

  renderer.render(scene, camera)
}
animate()