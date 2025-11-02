//преобразовывает с RA/Dec/Plx в X/Y/Z

class convertToXYZ {

    constructor(stars){        // очищенный массив 
        // здесь мы получаем массив звёзд и сохраняем его в классе
        this.stars = stars
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
        const x = distance * Math.cos(decRad) * Math.cos(raRad)
        const y = distance * Math.sin(decRad)
        const z = distance * Math.cos(decRad) * Math.sin(raRad)


       //возвращает новый объект с этими свойствами
        return {
            HIP: star.HIP,
            x: x,
            y: y,
            z: z,
            Vmag: star.Vmag,
            SpType: star.SpType
        }
        
    }

    convertAll(){
        return this.stars.map(star => this.convertStar(star)).filter(Boolean)
    }

}

export {convertToXYZ}
