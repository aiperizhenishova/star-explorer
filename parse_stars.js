import fs from 'fs'         //File System (читать файлы, создавать файлы, проверять, существуют ли папки/файлы и тд)
import Papa from 'papaparse'
import {convertToXYZ} from './convert_to_xyz.js'


//читаем csv с диска
const file = fs.readFileSync('hipparcos-voidmain.csv', 'utf8')


Papa.parse(file, {  //это команда библиотеки Papa Parse, которая берёт текст CSV и превращает его в массив объектов JS.
    header: true,   //говорит: «Первая строка — названия колонок».
    complete: function(results) {   //это коллбек, который срабатывает, когда парсинг закончен.
        const stars = []     //массив для отфильтрованных звезд

        results.data.forEach(row => {  //Проходим по каждой строке CSV
            // проверяем, что есть координаты и нормальный параллакс
            if (!row.RAdeg || !row.DEdeg) return
            if (row.Plx && Number(row.Plx) <= 0) return


            // создаём объект звезды с нужными полями
            const star = {
                HIP: row.HIP,
                HD: row.HD,
                BD: row.BD,
                RAdeg: row.RAdeg,
                DEdeg: row.DEdeg,
                RAhms: row.RAhms,
                DEdms: row.DEdms,
                Plx: row.Plx, 
                Vmag: row.Vmag,
                BTmag: row.BTmag,
                VTmag: row.VTmag,
                "V-I": row["V-I"],
                SpType: row.SpType,
                pmRA: row.pmRA,
                pmDE: row.pmDE,
                VarFlag: row.VarFlag,
                HvarType: row.HvarType,
                CombMag: row.CombMag,
                MultFlag: row.MultFlag,
                Ncomp: row.Ncomp
            }

            stars.push(star)   //добавляем в массив stars
        })

        console.log('first 5 clean stars:')
        console.log(stars.slice(0,5))      // первые 5 объектов из массива stars


        const converter = new convertToXYZ(stars)
        const xyzStars = converter.convertAll()
        console.log('first 5 XYZ stars:')
        console.log(xyzStars.slice(0,5))
        console.log('rows:')
        console.log(stars.length)

    }
})
