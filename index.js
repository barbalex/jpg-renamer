const fs = require('fs')
const getFileType = require('file-type')
const get = require('lodash/get')
const moment = require('moment')
const piexif = require('piexifjs')
const Datauri = require('datauri')

const datauri = new Datauri()

// 1. set the top directory to begin looking in
const dataDir = 'C:\\Users\\alex\\jpg-renamer\\testdata'
// use this line instead of above to test
//const dataDir = `${process.cwd()}\\testdata`

// 2. set the model of camera whose time setting was off
const cameraModel = 'SM-G950F'

// 3. set the time difference to correct for in milliseconds
// this number will be added to recorded time
// example: add 3 hours
const timeDiff = 3 * 60 * 60 * 1000

function executeForAllFilesInDir(dir) {
  // lest all files in directory...
  const files = fs.readdirSync(dir)
  // ...and loop them
  files.forEach(fileName => {
    const path = `${dir}\\${fileName}`
    // call this function recursively for contained directories
    if (fs.statSync(path).isDirectory()) {
      executeForAllFilesInDir(path)
    } else {
      // read file
      const file = fs.readFileSync(path)
      // only deal with jpg files
      const fileType = getFileType(file)
      if (fileType && fileType.mime === 'image/jpeg') {
        // piexif wants to receive a base-64 formatted string
        datauri.format('.jpg', file)
        const exifData = piexif.load(datauri.content)
        const model = get(exifData, '0th.272', null)
        if (model === cameraModel) {
          const dateTimeString = get(exifData, 'Exif.36867', null)
          console.log('dateTimeString:', dateTimeString)
          if (dateTimeString) {
            let dateTime = moment(dateTimeString, 'YYYY:MM:DD HH:mm:ss')
            // compensate for wrong time on camera
            dateTime = dateTime + timeDiff
            const newBaseFileName = moment(dateTime).format(
              'YYYY-MM-DD HH-mm-ss'
            )
            // extract base file name without extension
            // source: https://stackoverflow.com/a/4250408/712005
            const baseFileName = fileName.replace(/\.[^/.]+$/, '')
            // only rename if name changes
            if (newBaseFileName !== baseFileName) {
              const newPath = `${dir}\\${newBaseFileName}.jpg`
              console.log(`Renaming '${path}' to '${newPath}'`)
              fs.renameSync(path, newPath)
            }
          }
        }
      }
    }
  })
}
executeForAllFilesInDir(dataDir)
