import * as THREE from 'three'
import Papa from 'papaparse'
import { convertToXYZ } from './utils/convert_to_xyz'   //импорт звезд
import StarDistanceUtils from './utils/StarDistanceUtils'
import { initScene } from './components/StarScene'
import { starVertexShader, starFragmentShader } from './utils/shaders'
import { getColorBySpType, getColorFromVI } from './utils/colorUtils'
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { loadStarsCSV } from './utils/loadStars.js';


const {scene, camera, renderer, controls} = initScene();


// глобальные переменные
export let starsMesh;       // для Points
export let raycasterPoints;
let convertedStars;  // сюда сохраняются конвертированные звезды
let connectionLine = null;   // линия между ними
let selectedStars = []; // массив выбранных звезд
let constellationLines = [];
let constellationsVisible = false;
let searchRing = null;



// === RAYCASTER (mouse clicking, touchscreen) ===
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster() 
raycaster.params.Points.threshold = 5


// === ФУНКЦИЯ ПОКАЗА INFOBOX(инфо-окно) ===
function showStarInfo(starsData, screenX, screenY){
  const infoBox = document.getElementById('star-info-box')
  const closeBtn = document.getElementById('close-info')



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



function unHighLightStar(starsMesh, index){
  selectedStars.forEach(star => {
    const sizes = starsMesh.geometry.attributes.aSize.array;
    sizes[star.index] /= 1.5;
  });
  starsMesh.geometry.attributes.aSize.needsUpdate = true;
}



function handleClick(event){
  if(event.target.closest('.search-container') || 
     event.target.closest('#star-info-box') ||
     event.target.closest('.bottom-nav')) return;


  
     
  let x, y 
  if (event.touches && event.touches.length > 0){
    x = event.touches[0].clientX
    y = event.touches[0].clientY
  } else {
    x = event.clientX
    y = event.clientY
  }

  mouse.x = (x/window.innerWidth) * 2 - 1
  mouse.y = -(y/window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera);

  if (!raycasterPoints) return;
  const intersects = raycaster.intersectObject(raycasterPoints);
  
  
  if (intersects.length === 0) {
    clearSelection();
    return;
  }


  const index = intersects[0].index
  const starsData = convertedStars[index]
  const star = {starsData, index};

  
  if (selectedStars.length >= 2) {
    clearSelection();
  }

  selectedStars.push(star);
  StarDistanceUtils.highlightStar(starsMesh, index);
  showStarInfo(starsData, x + 10, y - 10);


  if (selectedStars.length === 2) {
    const star1 = selectedStars[0];
    const star2 = selectedStars[1];
    connectionLine = StarDistanceUtils.createConnectionLine(star1, star2, starsMesh, scene, connectionLine);
    const distance = StarDistanceUtils.calculateDistance(star1, star2);
    StarDistanceUtils.showDistanceBox(distance, star1, star2, starsMesh, camera, selectedStars);
  }
}


function clearSelection() {
  if (starsMesh) {
    selectedStars.forEach(star => {
      const sizes = starsMesh.geometry.attributes.aSize.array;
      sizes[star.index] /= 1.5;
    });
    starsMesh.geometry.attributes.aSize.needsUpdate = true;
  }

  if (connectionLine) {
    scene.remove(connectionLine);
    connectionLine.geometry.dispose();
    connectionLine.material.dispose();
    connectionLine = null;
  }

  // убирает distance box
  const distanceInfoBox = document.getElementById('distance-box');
  if (distanceInfoBox) distanceInfoBox.style.display = 'none';

  // убирает infobox
  const infoBox = document.getElementById('star-info-box');
  if (infoBox) infoBox.style.display = 'none';

  selectedStars = [];
}
window.clearSelection = clearSelection;
  


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



function drawConstellations(){

  console.log('HIP type:', typeof convertedStars[0].HIP)
  console.log('HIP value:', convertedStars[0].HIP)
  console.log('JSON HIP:', window.constellationData[0].lines[0][0])
  console.log('JSON HIP type:', typeof window.constellationData[0].lines[0][0])


  const starMap = {};
  convertedStars.forEach(star => {
    starMap[star.HIP] = star;
  });

  let found = 0, missing = 0;
  window.constellationData[0].lines[0].forEach(hip => {
    if(starMap[hip]) found++;
    else { missing++; console.log('missing HIP:', hip); }
  });
  console.log('found:', found, 'missing:', missing);


  const scale = 3000;
  window.constellationData.forEach(constellation => {
    constellation.lines.forEach(segment => {
      for(let i=0; i<segment.length - 1; i++){
        const s1 = starMap[segment[i]];
        const s2 = starMap[segment[i+1]];
        if (!s1 || !s2) return;

        const points = [
          new THREE.Vector3(s1.x * scale, s1.y * scale, s1.z * scale),
          new THREE.Vector3(s2.x * scale, s2.y * scale, s2.z * scale)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({color:0x4444ff, opacity:0.4, transparent: true});
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        constellationLines.push(line);
      }
    });
  });

}


window.showSearchRing = function(x, y, z) {
  if(searchRing) {
      scene.remove(searchRing);
      searchRing.geometry.dispose();
      searchRing.material.dispose();
      searchRing = null;
  }

  // создаём canvas с градиентом
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(180, 200, 255, 0.9)');  // центр яркий
  gradient.addColorStop(0.3, 'rgba(120, 150, 255, 0.4)'); // середина
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');           // края прозрачные
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
  });

  searchRing = new THREE.Sprite(material);
  searchRing.position.set(x, y, z);
  searchRing.scale.setScalar(60); // размер свечения
  scene.add(searchRing);
}



window.toggleConstellations = function(){
  if (constellationsVisible){
    constellationLines.forEach(line => {
      scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    constellationLines = [];
    constellationsVisible = false;
  }else{
    drawConstellations();
    constellationsVisible = true;
  }
}


// === ЗАГРУЗКА HIPPARCOS ===

loadStarsCSV().then(csvText => {
    
    const result = Papa.parse(csvText, { header: true, dynamicTyping: true });

    // ФильтруеТ строки, чтобы RAdeg, DEdeg и Plx были числами и Plx > 0
    const starsData = result.data.filter(row => {
      return row.RAdeg != null && row.DEdeg != null && row.Plx > 0
        && !isNaN(row.RAdeg) && !isNaN(row.DEdeg) && !isNaN(row.Plx)
        // Исключает очень яркие звёзды (Vmag < 3.0), которые слишком сильно пересвечивают центр
        && row.Vmag != null && row.Vmag <= 8.0; 
      });

    console.log('звёзд после фильтра:', starsData.length);  // ← добавь это
    console.log('первая звезда:', starsData[0]);

    // Конвертация в XYZ
    const converter = new convertToXYZ(starsData);
    converter.convertAll();
    convertedStars = converter.convertedStars;  // сохраняется глобально
    
    window.convertedStars = convertedStars;
    window.camera = camera;
    window.controls = controls;

    const positions = converter.getPositions();
    const scaleFactor = 3000; //СЖАТИЕ КООРДИНАТ
    for (let i = 0; i < positions.length; i++) {
      positions[i] *= scaleFactor; 
    }


    fetch('/constellations.json')
      .then(result => result.json())
      .then(data => {
        window.constellationData = data.constellations;
      });


    
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



      sizes[i] = Math.min((5 / (star.Vmag + 0.1)) * 5, 15); // визуально крупнее и Size: 5 / (star.Vmag + 0.1) // создали размер звезды
      
    }
    geometry.setAttribute('acolor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1)); // новый атрибут для шейдера

  const material = new THREE.ShaderMaterial({
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

    
  starsMesh = new THREE.Points(geometry, material);
  scene.add(starsMesh);
  window.starsMesh = starsMesh;



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


  
// === Анимация ===
function animate(){
  requestAnimationFrame(animate)
  controls.update()
  if(searchRing) searchRing.lookAt(camera.position);
  renderer.render(scene, camera)
  
}
animate()