const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      fs.mkdirSync('./uploads', {recursive: true})
      return cb(null, "./uploads")
  },
  filename: (req, file, cb) => {
      return cb(null, Date.now() + "-" + file.originalname)
  },
})

const uploadStorage = multer({
    storage: storage,
    limits: 1024*1024*6,
    fileFilter: (req,file,cb) => {
      if(file.fieldname === 'image' && file.size > 1024*1024*6) {
        return cb(new Error("image file size exceeds 6MB"));
      }
      cb(null, true);
    }
})

module.exports = { uploadStorage }