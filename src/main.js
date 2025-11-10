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
  75,         // угол обзора (field of view) в градусах
  window.innerWidth/window.innerHeight,     // соотношение сторон (aspect)
  0.1,        // ближняя плоскость отсечения (near)
  2000        // дальняя плоскость отсечения (far)
)
camera.position.z = 800      // позиция камеры по оси Z


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




// Функция для преобразования SpType в цвет (в HEX-формате)
function getColorBySpType(spType) {
  if (!spType) return 0xFFFFFF; // Белый, если нет данных
  
  // Берем первую букву спектрального класса например F из F5
  const mainType = spType.charAt(0).toUpperCase();        //F
  const subclass = parseInt(spType.slice(1)) || 0;    //5 

  // Цвета по классам (O, B, A, F, G, K, M)
  // Эти цвета более реалистично имитируют температуру звезды
  const colorMap = {
      'O': [0x9BB4FF, 0xA0C0FF],   // голубой, от ярко-синего до голубого
      'B': [0xAABFFF, 0xB0D0FF],   // голубовато-белый, светлый голубой
      'A': [0xF8F8FF, 0xFAFAFF],   // белый, почти чисто белый
      'F': [0xFCF8F5, 0xFFF0E0],   // желтовато-белый, теплый белый
      'G': [0xFFE08D, 0xFFD700],   // желтый, от мягкого до насыщенного желтого (Солнце ~G2)
      'K': [0xFFC97C, 0xFFB000],   // оранжевый, от светлого до насыщенного оранжевого
      'M': [0xFF7A68, 0xFF5500]    // красно-оранжевый, от яркого до насыщенного красного

  };

  const colors = colorMap[mainType] || [0xFFFFFF, 0xFFFFFF]
  const t = subclass / 9
  const color = Math.round(colors[0] * (1 - t) + colors[1] * t)

  return color; 
}



//вычисление  точного цвета BT-mag, VT-mag и VI
function getColorFromVI(VI) {
  if (VI == null) return 0xFFFFFF;  //белый по умолчанию
  // Чем больше VI → более красный
  // Чем меньше VI → более синий
  const t = Math.min(Math.max((VI - 0.0) / 2.0, 0), 1)   //нормализуем
  const r = 1.0 * t + 0.8 * (1 - t);  // красная компонента
  const g = 0.8 * (1 - t);            // зеленая компонента
  const b = 1.0 * (1 - t);            // синяя компонента
  return new THREE.Color(r, g, b);
}


//собственное движение звезды
function updateStarPositions(stars, deltaYears) {
  stars.forEach(star => {
      const factor = 0.01; // масштаб движения для сцены
      star.x += star.pmRA * factor * deltaYears;
      star.y += star.pmDE * factor * deltaYears;
  });
}


let starsMesh;       // для Points
let convertedStars;  // сюда сохраняем конвертированные звезды

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
    convertedStars = converter.convertedStars;  // сохраняем глобально
    const positions = converter.getPositions();

    //СЖАТИЕ КООРДИНАТ
    const scaleFactor = 200; 

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
      

      const colorSp = new THREE.Color(getColorBySpType(star.SpType));
      const colorVI = getColorFromVI(star.VI);
      const c = colorSp.lerp(colorVI, 0.5); // смесь 50/50

      colors[i*3]     = c.r;
      colors[i*3 + 1] = c.g;
      colors[i*3 + 2] = c.b;


  
      sizes[i] = (5 / (star.Vmag + 0.1)) * 8; // визуально крупнее и Size: 5 / (star.Vmag + 0.1) // создали размер звезды
      
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
        gl_PointSize = aSize * (200.0 / max(1.0, -mvPosition.z));
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

  if (starsMesh && convertedStars) {
    starsMesh.rotation.y += 0.0003

    // пример движения на 1 год:
    updateStarPositions(convertedStars, 1);

    // обновляем позиции буфера
    const posAttr = starsMesh.geometry.getAttribute('position');
    for (let i = 0; i < convertedStars.length; i++){
      posAttr.setXYZ(i, convertedStars[i].x, convertedStars[i].y, convertedStars[i].z);
    }
    posAttr.needsUpdate = true;
  }  
  renderer.render(scene, camera)
  
}
animate()