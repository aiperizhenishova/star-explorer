import * as THREE from 'three'
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { convertToXYZ } from '../convert_to_xyz'   //импортирую звезды
import Papa from 'papaparse'
import { color, convert, max } from 'three/tsl'
import StarDistanceUtils from './StarDistanceUtils.js'


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
document.body.appendChild(renderer.domElement)


// === ФУНКЦИЯ ПОКАЗА INFOBOX(инфо-окно) ===
function showStarInfo(starsData, screenX, screenY){
  const infoBox = document.getElementById('star-info-box')
  const closeBtn = document.getElementById('close-info')

  // Обработчик для кнопки закрытия
  closeBtn.addEventListener('click', (event) =>{
    event.stopPropagation();
    infoBox.style.display = 'none';
  })

  // Обработчик для самого окна, чтобы клики по тексту не проходили к сцене
  // infoBox.addEventListener('click', (event) => {
  //   event.stopPropagation();
  // })

  function hideStarInfo() {
    document.getElementById('star-info-box').style.display = 'none';
  }

  if(!infoBox){
    console.error("Element #star-info-box not found")
    return
  }

  document.getElementById('star-name').textContent = starsData.HIP || starsData.ID || 'Unammed star'
  document.getElementById('star-vmag').textContent = starsData.Vmag ? starsData.Vmag.toFixed(2) : 'N/A'
  document.getElementById('star-sptype').textContent = starsData.SpType || 'N/A'
  document.getElementById('star-distance').textContent = starsData.distance?.toFixed(1) || "N/A";
  document.getElementById('star-size').textContent = starsData.Size.toFixed(2);

  // const plx = starsData.Plx   // просто берёт Plx
  // const distance = plx > 0 ? (1000 / plx).toFixed(2) : 'N/A'
  // document.getElementById('star-distance').textContent = distance

  infoBox.style.left = `${screenX}px`
  infoBox.style.top = `${screenY}px`
  infoBox.style.transform = 'translate(0, 0)'

  infoBox.style.display = 'block'

}


// === RAYCASTER (mouse clicking, touchscreen) ===
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster() 

//То есть если курсор или палец находится в пределах 5 пикселей от точки, 
// Raycaster считает, что её выбрали.
//Без этого Raycaster для точек с маленьким размером почти никогда не срабатывает.
raycaster.params.Points.threshold = 5



function handleClick (event){

  let x, y 

  if (event.touches && event.touches.length > 0){
    //touchpad
    x = event.touches[0].clientX
    y = event.touches[0].clientY
  }else{
     //mouse
    x = event.clientX
    y = event.clientY
  }

  //нормализовать координаты
  mouse.x = (x/window.innerWidth) * 2 - 1
  mouse.y = -(y/window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  if (!raycasterPoints) return;

  const intersects = raycaster.intersectObject(raycasterPoints);

  //если есть пересечение берет номер этой звезды
  if (intersects.length > 0){

    const index = intersects[0].index   //номер звезды
    const starsData = convertedStars[index]   //достаёт данные конкретной звезды 
    selectedStars.push({starsData, index});  // текущая звезда

      if(selectedStars.length === 1){
        showStarInfo(starsData);
      } else if(selectedStars.length >= 2){
        const star1 = selectedStars[0];
        const star2 = selectedStars[1];

        // возвращает размер звезды
        selectedStars.forEach(item =>{
          const sizes = starsMesh.geometry.attributes.aSize.array;
          sizes [item.index] /= 1.5;
        });
        starsMesh.geometry.attributes.aSize.needsUpdate = true;
        
        // показывает инфо-бокс второй звезды
        showStarInfo(star2.starsData, x + 10, y - 10);

        // рисует линию между звездами 
        connectionLine = StarDistanceUtils.createConnectionLine(star1, star2, scene, connectionLine);

        // рассчитывает дистанцию
        const distance = StarDistanceUtils.calculateDistance(star1.starsData, star2.starsData);
        if(distance !== undefined && distance !== null){
          StarDistanceUtils.showDistanceBox(distance, star1, star2);
        }else{
          console.log('Distance cannot be calculated');
        }
        // показывает расстояние над линией
        StarDistanceUtils.showDistanceBox(distance, star1, star2);

        // сбрасывает массив
        selectedStars = [];   // очищает старый выбор
      }

      selectedStars.push({starsData, index});

      StarDistanceUtils.highlightStar(starsMesh, index);

      if(selectedStars.length === 2){
        connectionLine = StarDistanceUtils.createConnectionLine(selectedStars[0], selectedStars[1], scene, connectionLine);
        const distance = StarDistanceUtils.calculateDistance(selectedStars[0].starsData, selectedStars[1].starsData);
        console.log("Distance between stars: ", distance.toFixed(2), "parces");

        showStarInfo(selectedStars[1].starsData, x + 10, y - 10);
      }
    }else{
      const infoBox = document.getElementById('star-info-box');
      if(infoBox) infoBox.style.display = "none";
    }
}
  


let pointerDown = false;
let startX = 0;
let startY = 0;
const TAP_THRESHOLD = 10; 

window.addEventListener("pointerdown", (e) => {
    pointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener("pointerup", (e) => {
    if (!pointerDown) return;
    pointerDown = false;

    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    // если пользователь двигал палец/мышь → это вращение, не клик
    if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) return;

    handleClick(e); // <-- вместо onClick
});






// resize для изменения окна 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})




// === УПРАВЛЕНИЕ КАМЕРОЙ ===
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.screenSpacePanning = false
controls.minDistance = 2
controls.maxDistance = 1000
controls.target.set(0, 0, 100)
controls.update()



// === ЦВЕТА ЗВЕЗД (в HEX-формате) === 
function getColorBySpType(spType) {
  if (!spType) return 0xFFFFFF; // Белый, если нет данных
  
  // Берет первую букву спектрального класса например F из F5
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


// === СОБСТЕННОЕ ДВИЖЕНИЕ ЗВЕЗДЫ ===
// function updateStarPositions(stars, deltaYears) {
//   stars.forEach(star => {
//       const factor = 0.01; // масштаб движения для сцены
//       star.x += star.pmRA * factor * deltaYears;
//       star.y += star.pmDE * factor * deltaYears;
//   });
// }






// === ЗАГРУЗКА CSV HIPPARCOS ===

let starsMesh;       // для Points
let convertedStars;  // сюда сохраняются конвертированные звезды
let raycasterPoints;
let connectionLine = null;   // линия между ними
let selectedStars = [];      // массив выбранных звезд


fetch('/star-explorer/hipparcos-voidmain.csv')
  .then(res => res.text())
  .then(csvText => {
    const result = Papa.parse(csvText, { header: true, dynamicTyping: true });

    // ФильтруеТ строки, чтобы RAdeg, DEdeg и Plx были числами и Plx > 0
    const starsData = result.data.filter(row => {
      return row.RAdeg != null && row.DEdeg != null && row.Plx > 0
        && !isNaN(row.RAdeg) && !isNaN(row.DEdeg) && !isNaN(row.Plx)
        // Исключает очень яркие звёзды (Vmag < 3.0), которые слишком сильно пересвечивают центр
        && row.Vmag != null && row.Vmag >= 3.0 && row.Vmag <= 8.0; 
      });



    // Конвертация в XYZ
    const converter = new convertToXYZ(starsData);
    converter.convertAll();
    convertedStars = converter.convertedStars;  // сохраняется глобально
    
    const positions = converter.getPositions();
    const scaleFactor = 3000; //СЖАТИЕ КООРДИНАТ
    for (let i = 0; i < positions.length; i++) {
      positions[i] *= scaleFactor; 
    }


    
    // === СОЗДАНИЕ THREE.JS ОБЪКТОВ ===
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



      sizes[i] = (5 / (star.Vmag + 0.1)) * 5; // визуально крупнее и Size: 5 / (star.Vmag + 0.1) // создали размер звезды
      
    }
    geometry.setAttribute('acolor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1)); // новый атрибут для шейдера



  // === SHADERS ===
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

        // добавление лучей
        float angle = atan(cxy.y, cxy.x);
        float spikes = abs(sin(angle * 10.0)) * 0.3;

        // базовое свечение
        float strength = 1.0 - r * r;    // для более мягкого градиента к краю
        strength += spikes;
        float multiplier = 0.7;
        
        gl_FragColor = vec4(vColor * strength * multiplier, strength * multiplier); // strength как альфа-канал для более мягкого края
      }
    `;


  const material = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,  
      fragmentShader: starFragmentShader, 
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false, 
      vertexColors: true
  });

  starsMesh = new THREE.Points(geometry, material);
  scene.add(starsMesh);



  const rayGeometry = new THREE.BufferGeometry();
  rayGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const rayMat = new THREE.PointsMaterial({
    size: 5,           // важно > 0
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
  });
  raycasterPoints = new THREE.Points(rayGeometry, rayMat);
  scene.add(raycasterPoints);
  });



  function worldToScreen (position, camera, renderer){
    const vector = position.clone().project(camera)

    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = ( -vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

    return{x, y}
  }




  const infoBox = document.getElementById('star-info-box')
  const closeBtn = document.getElementById('close-info')

  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation()          // клик не идёт к сцене → Raycaster не срабатывает
    infoBox.style.display = 'none'   //скрывает окно полностью
  })

  

  
// === Анимация ===
function animate(){
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  
}
animate()