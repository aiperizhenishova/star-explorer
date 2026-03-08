import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { cameraFar, distance } from 'three/tsl';

export default class StarDistanceUtils{

  
// === создание линии между 2 звездами ===
static createConnectionLine(star1, star2, starsMesh, scene, connectionLine){
    const position1 = starsMesh.geometry.attributes.position.array.slice(star1.index*3,star1.index*3+3);
    const position2 = starsMesh.geometry.attributes.position.array.slice(star2.index*3,star2.index*3+3);

    const points = [
      new THREE.Vector3(position1[0], position1[1], position1[2]),
      new THREE.Vector3(position2[0], position2[1], position2[2])
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 5});
    
    if(connectionLine){
      scene.remove(connectionLine);
      connectionLine.geometry.dispose();
      connectionLine.material.dispose();
    }
  
    connectionLine = new THREE.Line(geometry, material);
    scene.add(connectionLine);
    return connectionLine;
  
  }
  
// === подсвечивает выбранные звезды ===
static highlightStar(starsMesh, index){
    const sizes = starsMesh.geometry.attributes.aSize.array;
    sizes[index] *= 1.5;
    starsMesh.geometry.attributes.aSize.needsUpdate = true;
  }

  
  
// расчет расстояния
static calculateDistance(star1, star2){
    const dx = star1.starsData.x - star2.starsData.x;
    const dy = star1.starsData.y - star2.starsData.y;
    const dz = star1.starsData.z - star2.starsData.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

static toScreenPosition(Vector3, camera) {
  const vector = Vector3.clone().project(camera);
  return{
    x: (vector.x + 1) / 2 * window.innerWidth,
    y: (-vector.y + 1) / 2 * window.innerHeight
  };
}


static showDistanceBox(distance, star1, star2, starsMesh, camera, selectedStars){
  const distanceInfoBox = document.getElementById('distance-box');
  if(!distanceInfoBox) return;

  const distanceKm = distance * 3.086e13;
  const distanceLy = distance * 3.26;

  const position1 = starsMesh.geometry.attributes.position.array.slice(star1.index*3,star1.index*3+3);
  const position2 = starsMesh.geometry.attributes.position.array.slice(star2.index*3,star2.index*3+3);
  
  const mid3D = new THREE.Vector3(
    (position1[0] + position2[0] / 2),
    (position1[1] + position2[1] / 2),
    (position1[2] + position2[2] / 2)
  );
  const screen = StarDistanceUtils.toScreenPosition(mid3D, camera);

  // const starHIP1 = selectedStars[0];
  // const starHIP2 = selectedStars[1];

  distanceInfoBox.style.display = 'block';
  distanceInfoBox.innerText = `Distance between ${selectedStars[0].starsData.HIP}  and ${selectedStars[1].starsData.HIP}: ${distance.toFixed(3)}pc ~ ${distanceLy.toFixed(2)}ly ~ ${(distanceKm / 1e9).toFixed(1)} billion km`;
}

}