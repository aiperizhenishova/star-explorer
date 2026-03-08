import * as THREE from 'three'

// === ЦВЕТА ЗВЕЗД (в HEX-формате) === 
export function getColorBySpType(spType) {
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
  export function getColorFromVI(VI) {
    if (VI == null) return 0xFFFFFF;  //белый по умолчанию
    // Чем больше VI → более красный
    // Чем меньше VI → более синий
    const t = Math.min(Math.max((VI - 0.0) / 2.0, 0), 1)   //нормализуем
    const r = 1.0 * t + 0.8 * (1 - t);  // красная компонента
    const g = 0.8 * (1 - t);            // зеленая компонента
    const b = 1.0 * (1 - t);            // синяя компонента
    return new THREE.Color(r, g, b);
  }
  
  