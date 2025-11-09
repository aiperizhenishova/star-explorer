//преобразовывает с RA/Dec/Plx в X/Y/Z

class convertToXYZ {

    constructor(stars){        // очищенный массив 
        // здесь мы получаем массив звёзд и сохраняем его в классе
        this.stars = stars
        this.convertedStars = null    // сюда будем сохранять конвертированные звезды
    }


    // метод который переводит градусы в радианы
    degToRad(deg) {
        return deg * (Math.PI / 180)
    }


    // метод для преобразования одной звезды
    convertStar(star) {
        //проверяет 
        if (!star.RAdeg || !star.DEdeg || !star.Plx || Number(star.Plx) <= 0){
            return null;
        }

        //переводит в радианы и сохраняет в перемен
        //Number(star.RAdeg) – превращает строку в число, чтобы с ним можно было делать математику.
        //this.degToRad(...) – это метод класса, который переводит градусы в радианы по формуле
        const raRad = this.degToRad(Number(star.RAdeg))  
        const decRad = this.degToRad(Number(star.DEdeg))


        //считает расстояние
        const distance = 1000 / Number(star.Plx)


        //преобраз в x y z
        const x = distance * Math.cos(decRad) * Math.cos(raRad) / this.Scale
        const y = distance * Math.sin(decRad) / this.Scale
        const z = distance * Math.cos(decRad) * Math.sin(raRad) /this.Scale


        if ([x, y, z].some(v => isNaN(v))) return null; // фильтруем NaN

       //возвращает новый объект с этими свойствами
        return {
            HIP: star.HIP,   //название
            x: x,
            y: y,
            z: z,
            Vmag: star.Vmag,    //яркость 
            SpType: star.SpType  //цвет
        }
        
    }

    convertAll() {
        // высчитываем дистанции прямо из Plx
        const distances = this.stars.map(star => 1000 / Number(star.Plx));
        const maxDist = Math.max(...distances);
        this.Scale = maxDist / 100;
    
        this.convertedStars = this.stars.map(star => this.convertStar(star)).filter(Boolean);
        return this.convertedStars;
    }
    


    getPositions(){
        if (!this.convertedStars) this.convertAll()     //считает converAll

            const positions = new Float32Array(this.convertedStars.length * 3)
            for (let i = 0; i < this.convertedStars.length; i++){
                const star = this.convertedStars[i]
                positions[i * 3] = star.x
                positions[i * 3 + 1] = star.y
                positions[i * 3 + 2] = star.z
            }
            return positions
    }

}

export {convertToXYZ}
