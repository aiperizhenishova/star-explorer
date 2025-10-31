import * as THREE from 'three'
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js'


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
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


// resize для изменения окна 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})




//объект
// const geometry = new THREE.SphereGeometry(1, 32, 32)
// const material = new THREE.MeshBasicMaterial({color: 0xffff00})
// const star = new THREE.Mesh(geometry, material)
// scene.add(star)



//1000 звезд
const geometry = new THREE.BufferGeometry()
const starCount = 1000

//массив координат всех звезд
const positions = new Float32Array(starCount * 3)

for (let i = 0; i < starCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 1000
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size:1,
})

const stars = new THREE.Points(geometry, material)
scene.add(stars)




//управление камерой
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.screenSpacePanning = false
controls.minDistance = 2
controls.maxDistance = 400






//функция для постоянного рендера и анимации
function animate(){
  requestAnimationFrame(animate)

  //stars.rotation.y += 0.01

  renderer.render(scene, camera)
}
animate()