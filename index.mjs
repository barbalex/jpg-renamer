import fs from 'fs'
import { format } from 'util'
import path from 'path'
import piexif from 'piexifjs'
import { fileTypeFromFile } from 'file-type'
import moment from 'moment'
import DatauriParser from 'datauri/parser.js'
const parser = new DatauriParser()

// logging to file and console: https://stackoverflow.com/a/21061306/712005
var logFile = fs.createWriteStream(
  'D:\\Dropbox\\Familienbereich\\Gabriel_Multimedia\\Bilder\\2017\\costa_rica_renaming\\renaming.log',
  { flags: 'w' },
)
const logStdout = process.stdout

// 1. set the top directory to begin looking in
// const dataDir = 'C:\\Users\\alex\\jpg-renamer\\testdata'
const dataDirs = [
  '2017 08 2 Cahuita',
  '2017 08 1 Tortuguero',
  '2017 08 4 Laguna del Lagarto',
  '2017 08 5 La Fortuna',
  '2017 08 6 Monteverde',
  '2017 08 7 Rincon de la Vieja',
  '2017 08 8 Samara',
  '2017 08 9 Quepos',
]
const dataDir =
  'D:\\Dropbox\\Familienbereich\\Gabriel_Multimedia\\Bilder\\2017\\costa_rica_renaming'
// use this line instead of above to test
//const dataDir = `${process.cwd()}\\testdata`

// 2. set the model of camera whose time setting was off
// const cameraModelWithCorrectTime = 'SM-G950F' // handy Barbara
const cameraModels = ['TG-5', 'DMC-FZ2000']

// 3. set the time difference to correct for in milliseconds
// this number will be added to recorded time
// example: add 3 hours
// values set: -18 hours
//             =
// example: 2017-07-27 13-01-54 to: 2017-07-26 21-00-00
// diff: -16 h 1 min 54 sec
const timeDiff = 16 * 60 * 60 * 1000 + 1 * 60 * 1000 + 54 * 1000

async function executeForAllFilesInDir(dir) {
  // reads all files in directory...
  const files = fs.readdirSync(dir)
  // ...and loop them
  for (const fileName of files) {
    const filePath = `${dir}\\${fileName}`
    console.log(`filePath:`, filePath)
    // call this function recursively for contained directories
    if (fs.statSync(filePath).isDirectory()) {
      executeForAllFilesInDir(filePath)
    } else {
      // read file
      const fileType = await fileTypeFromFile(filePath)
      const mimeType = fileType?.mime
      // console.log(`mimetype for ${filePath}:`, mimeType)
      if (mimeType !== 'image/jpeg') {
        console.log(
          `skipping ${filePath}, because its mimetype ${mimeType} is not a jpeg`,
        )
        return
      }
      const file = fs.readFileSync(filePath)
      // piexif wants to receive a base-64 formatted string
      const parsedFile = parser.format('.jpg', file)
      const exifData = piexif.load(parsedFile.content)
      // const model = get(exifData, '0th.272', null)
      const model = exifData['0th'][272]
      if (!(model && cameraModels.includes(model))) {
        console.log(
          `skipping ${filePath}, because model ${model} is not in list`,
        )
        return
      }
      // const dateTimeString = get(exifData, 'Exif.36867', null)
      const dateTimeString = exifData.Exif[36867]
      if (dateTimeString) {
        let dateTime = moment(dateTimeString, 'YYYY:MM:DD HH:mm:ss')
        // compensate for wrong time on camera
        dateTime = dateTime + timeDiff
        const newBaseFileName = moment(dateTime).format('YYYY-MM-DD HH-mm-ss')
        // extract base file name without extension
        // source: https://stackoverflow.com/a/4250408/712005
        const baseFileName = fileName.replace(/\.[^/.]+$/, '')
        // only rename if name changes
        if (newBaseFileName !== baseFileName) {
          const newPath = `${dir}\\${newBaseFileName}.jpg`
          const logMessage = `Renaming '${filePath}' to '${newPath}'`
          console.log(logMessage)
          logFile.write(format(logMessage) + '\n')
          fs.renameSync(filePath, newPath)
        }
      }
    }
  }
}
executeForAllFilesInDir(dataDir)
