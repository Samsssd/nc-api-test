const asyncHandler = require("express-async-handler");
const {
  getSignedViewURL,
  deleteS3Object,
  uploadS3Object,
  generateUploadURL
} = require("../middleware/s3Middleware");
const multer = require("multer");
const sharp = require("sharp");
const mongoose = require("mongoose");
require("dotenv").config();
const ffmpeg = require("fluent-ffmpeg");

const bucketName = process.env.AWS_BUCKET_NAME;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes("image") || file.mimetype.includes("video")) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Seules les images et les vidéos sont acceptées!"));
  }
};

const upload = multer({ storage: storage, fileFilter });


const getUploadURL = asyncHandler(async (req, res) => {
  const info = await generateUploadURL();
  res.json({ url: info.uploadURL, mediaKey: info.mediaKey });
});

const getViewURL = asyncHandler(async (req, res) => {
  const url = await getSignedViewURL(req.body.mediaKey);
  res.status(200).json({ url });
});

const deleteMedia = asyncHandler(async (req, res) => {
  try {
    await deleteS3Object(req.params.id);
    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "error" });
  }
});

const uploadMedia = asyncHandler(async (req, res) => {
  let file = req.file;
  let fileType = file.mimetype;

  if (file.mimetype.includes("image")) {
    file = await sharp(file.buffer).jpeg({ mozjpeg: true }).rotate().toBuffer();

    fileType = "image/jpeg";
  }
 

  const mediaKey = new mongoose.Types.ObjectId().toString();

  const uploadConfig = {
    Bucket: bucketName,
    Body: file.buffer,
    Key: mediaKey,
    ContentType: fileType,
  };

  try {
    uploadS3Object(uploadConfig);
    res.status(200).json({ key: mediaKey });
  } catch (err) {
    res.status(400).json({ message: "upload error" });
  }
});

const uploadStoryMedia = asyncHandler(async (req, res) => {
  let file = req.file;
  let fileType = file.mimetype;

  if (file.mimetype.includes("image")) {
    file = await sharp(file.buffer).jpeg({ mozjpeg: true }).rotate().toBuffer();

    fileType = "image/jpeg";
  }

  let mediaKey = new mongoose.Types.ObjectId();
  mediaKey = `stories/${mediaKey.toString()}`;

  const uploadConfig = {
    Bucket: bucketName,
    Body: file.buffer,
    Key: mediaKey,
    ContentType: fileType,
  };

  try {
    uploadS3Object(uploadConfig);
    res.status(200).json({ key: mediaKey });
  } catch (err) {
    res.status(400).json({ message: "upload error" });
  }
});

module.exports = {
  getUploadURL,
  getViewURL,
  deleteMedia,
  uploadMedia,
  upload,
  uploadStoryMedia,
};
