import * as THREE from 'three'
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { convertToXYZ } from '../convert_to_xyz'   //импортирую звезды
import Papa from 'papaparse'
import { color, convert, max } from 'three/tsl'


document.body.style.margin = '0';
document.body.style.padding = '0';
document.documentElement.style.overflow = 'hidden';

//сцена
const scene = new THREE.Scene()

//камера
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  2000
)
camera.position.z = 500


//рендер
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 1)
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


let starsMesh; // объявляем глобально

// Функция для преобразования SpType в цвет (в HEX-формате)
function getColorBySpType(spType) {
  if (!spType) return 0xFFFFFF; // Белый, если нет данных
  
  // Берем первую букву спектрального класса
  const type = spType.charAt(0).toUpperCase();

  // Цвета по классам (O, B, A, F, G, K, M)
  // Эти цвета более реалистично имитируют температуру звезды
  const colorMap = {
      'O': 0x9BB4FF, // Синий/Голубой
      'B': 0xAABFFF, // Голубовато-белый
      'A': 0xF8F8FF, // Чистый белый
      'F': 0xFCF8F5, // Желтовато-белый
      'G': 0xFFE08D, // Желтый (как Солнце)
      'K': 0xFFC97C, // Оранжевый
      'M': 0xFF7A68  // Красно-оранжевый
  };

  return colorMap[type] || 0xFFFFFF; // Возвращаем цвет или белый по умолчанию
}




fetch('hipparcos-voidmain.csv')
  .then(res => res.text())
  .then(csvText => {
    const result = Papa.parse(csvText, { header: true, dynamicTyping: true });

    // Фильтруем строки, чтобы RAdeg, DEdeg и Plx были числами и Plx > 0
    const starsData = result.data.filter(row => {
      return row.RAdeg != null && row.DEdeg != null && row.Plx > 0
        && !isNaN(row.RAdeg) && !isNaN(row.DEdeg) && !isNaN(row.Plx)
        // ⚡️ НОВОЕ: Проверяем, что Vmag существует и ограничиваем яркость
        && row.Vmag != null && row.Vmag <= 8.0; 
      });

    // Конвертация в XYZ
    const converter = new convertToXYZ(starsData);
    converter.convertAll();
    const positions = converter.getPositions();

    //СЖАТИЕ КООРДИНАТ
    const scaleFactor = 700; 

    for (let i = 0; i < positions.length; i++) {
      positions[i] *= scaleFactor; 
    }

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
    const sizes = new Float32Array(converter.convertedStars.length);

    for (let i = 0; i < converter.convertedStars.length; i++) {
      const star = converter.convertedStars[i]
      

      const hexColor = getColorBySpType(star.SpType);
      const c = new THREE.Color(hexColor);

      colors[i*3]     = c.r;
      colors[i*3 + 1] = c.g;
      colors[i*3 + 2] = c.b;


      // РАЗМЕР: берем из CSV (например Vmag), преобразуем в удобный диапазон
      // чем меньше Vmag (ярче звезда), тем больше точка
      sizes[i] = star.Size; // если в CSV уже есть готовый размер
      
    }
    geometry.setAttribute('acolor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1)); // новый атрибут для шейдера



    const starVertexShader = `
      precision highp float;

      uniform float size;
      attribute vec3 acolor;
      attribute float aSize; // размер каждой точки
      varying vec3 vColor;

      void main() {
        vColor = acolor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (300.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const starFragmentShader = `
      precision mediump float;

      varying vec3 vColor;

      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) discard;
        gl_FragColor = vec4(vColor * (1.0 - r * 0.5), 1.0);
      }
    `;



const material = new THREE.ShaderMaterial({
    // uniforms: {
    //   size: { value: 3 } 
    // },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });


    starsMesh = new THREE.Points(geometry, material);
    scene.add(starsMesh);
  });





//функция для постоянного рендера и анимации
function animate(){
  requestAnimationFrame(animate)

  if (starsMesh) starsMesh.rotation.y += 0.0003

  renderer.render(scene, camera)
}
animate()