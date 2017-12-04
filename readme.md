# What is this?

We name our pictures by date-time using a handy tool called renamer. Example: `2017-08-03 12-15-33.jpg`.

This script is used because on vacation one of our cameras' time setting was off. So now the file names generated from the exif data are wrong. Worse: Pictures of different cameras are not ordered chronologically inside folders.

This script:

- renames all jpg files
- of a distinct camera
- in a folder and all it's children
- using the date included in exif-data
- and accounting for the time difference that the camera's clock was off
- but only if the name differs from the original name

You need to set three variables in index.js:

- dataDir (top folder to begin in)
- cameraModel
- timeDiff

Please don't forget to generate a backup in case something goes wrong.