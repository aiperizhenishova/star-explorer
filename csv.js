import fs from 'fs'
import Papa from 'papaparse'

// читаем CSV с диска
const file = fs.readFileSync('hipparcos-voidmain.csv', 'utf8')

Papa.parse(file, {
  header: true,
  complete: function(results) {
    console.log('Первые 5 строк CSV:')
    console.log(results.data.slice(0,5))
  }
})