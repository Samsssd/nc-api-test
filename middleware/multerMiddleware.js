const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes("image") || file.mimetype.includes("video")) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Seules les images et les vidéos sont acceptées!"));
  }
};

const uploadToMemory = multer({ storage: storage, fileFilter });

module.exports = { uploadToMemory };
