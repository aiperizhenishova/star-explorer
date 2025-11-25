import fs from 'fs'
import Papa from 'papaparse'
import { distance } from 'three/tsl';

// читаем CSV с диска
const file = fs.readFileSync('hipparcos-voidmain.csv', 'utf8')

// парсим
const result = Papa.parse(file, {
  header: true,
  dynamicTyping: true,
});

// фильтруем только нужные поля
const stars = result.data.map(star => ({
  HIP: star.HIP,   //название
  RAdeg: star.RAdeg,
  DEdeg: star.DEdeg,
  Plx: star.Plx,
  Vmag: star.Vmag,    //яркость 
  SpType: star.SpType,  //цвет
  BTmag: star.BTmag,    // Яркость в синем фильтре B
  VTmag: star.VTmag,    // Яркость в видимом фильтре V
  VI: star['V-I'],      // Цветовой индекс (V-I), показывает оттенок звезды (больший индекс = более красная)
  pmRA: star.pmRA,      // Собственное движение звезды по RA (миллисекунды дуги в год)
  pmDE: star.pmDE,      // Собственное движение звезды по Dec
  Size: 5 / (star.Vmag + 0.1), // размер звезды для визуализации
  distance: distance
}));

// 1. Найти максимальный размер
const maxSize = Math.max(...stars.map(star => star.Size));
console.log('max size:', maxSize);

// 2. Найти саму звезду
const biggestStar = stars.find(star => star.Size === maxSize);
console.log('the biffest star:', biggestStar);


console.log('first five rows in CSV:')
console.log(stars.slice(0,5))

//console.log(result.data.slice(0,5)) //выводит сырые данные

