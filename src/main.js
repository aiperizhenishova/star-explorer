import * as THREE from 'three'
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { convertToXYZ } from '../convert_to_xyz'   //импортирую звезды
import Papa from 'papaparse'
import { color, convert } from 'three/tsl'



//сцена
const scene = new THREE.Scene()

//камера
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  2000
)
camera.position.z = 10


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
// const starCount = 1000

// .//массив координат всех звезд
// const positions = new Float32Array(starCount * 3)

// for (let i = 0; i < starCount * 3; i++) {
//   positions[i] = (Math.random() - 0.5) * 1000
// }


// const material = new THREE.PointsMaterial({
//   color: 0xffffff,
//   size:1,
// })

// const stars = new THREE.Points(geometry, material)
// scene.add(stars)



//управление камерой
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.screenSpacePanning = false
controls.minDistance = 2
controls.maxDistance = 400





fetch('hipparcos-voidmain.csv')
  .then(res => res.text())
  .then(csvText => {
    const result = Papa.parse(csvText, { header: true, dynamicTyping: true });

    // Фильтруем строки, чтобы RAdeg, DEdeg и Plx были числами и Plx > 0
    const starsData = result.data.filter(row => {
      return row.RAdeg != null && row.DEdeg != null && row.Plx > 0
             && !isNaN(row.RAdeg) && !isNaN(row.DEdeg) && !isNaN(row.Plx);
    });

    // Конвертация в XYZ
    const converter = new convertToXYZ(starsData);
    converter.convertAll();
    const positions = converter.getPositions();

    
    // Проверка: выводим первые 10 координат, чтобы убедиться, что нет NaN
    console.log('positions sample:', positions.slice(0, 10));


    if (positions.some(v => isNaN(v))) {
      console.error('positions содержит NaN!', positions);
      return;
    }
    


    // Создаём Three.js объекты
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));



    const colors = new Float32Array(positions.length)
    for (let i = 0; i < converter.convertedStars.length; i++) {
      const star = converter.convertedStars[i]

      const c = new THREE.Color()
      c.setHSL(0.6 - star.Vmag * 0.05, 1.0, 0.5)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))




    const textureLoader =new THREE.TextureLoader()
    const starTexture = textureLoader.load('stars.png')
    const material = new THREE.PointsMaterial({
       size: 3,
       map: starTexture,
       transparent: true,
       vertexColors: true,
       sizeAttenuation: true
      });
    const starsMesh = new THREE.Points(geometry, material);
    scene.add(starsMesh);
  });





//функция для постоянного рендера и анимации
function animate(){
  requestAnimationFrame(animate)

  //stars.rotation.y += 0.01

  renderer.render(scene, camera)
}
animate()