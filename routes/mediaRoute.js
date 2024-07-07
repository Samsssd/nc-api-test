const express = require('express');
const router = express.Router();
const { getUploadURL, getViewURL, deleteMedia, uploadMedia, uploadStoryMedia, upload } = require('../controllers/s3Controller');
const { protect } = require("../middleware/authMiddleware")


router
    .route('/upload')
    .post(protect, upload.single('file'), uploadMedia)

router
    .route('/get-upload-url')
    .get(protect, getUploadURL)

router
    .route('/upload/story')
    .post(protect, upload.single('file'), uploadStoryMedia)

router
    .route('/delete/:id')
    .delete(protect, deleteMedia)

module.exports = router