import * as THREE from 'three';

export default class StarDistanceUtils{

  
// === создание линии между 2 звездами ===
static createConnectionLine(star1, star2, scene, connectionLine){
    const points = [
      new THREE.Vector3(
        star1.starsData.x * 3000,
        star1.starsData.y * 3000,
        star1.starsData.z * 3000
      ),
      new THREE.Vector3(
        star2.starsData.x * 3000,
        star2.starsData.y * 3000,
        star2.starsData.z * 3000
      )
    ];
  
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 5});
    
    if(connectionLine){
      scene.remove(connectionLine);
      connectionLine.geometry.dispose();
      connectionLine.material.dispose();
      connectionLine = null;
    }
  
    connectionLine = new THREE.Line(geometry, material);
    scene.add(connectionLine);
  
  }
  
// === подсвечивает выбранные звезды ===
static highlightStar(starsMesh, index){
    const sizes = starsMesh.geometry.attributes.aSize.array;
    sizes[index] *= 1.5;
    starsMesh.geometry.attributes.aSize.needsUpdate = true;
  }
  
  
// расчет расстояния
static calculateDistance(star1, star2){
    const dx = star1.x - star2.x;
    const dy = star1.y - star2.y;
    const dz = star1.z - star2.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

}