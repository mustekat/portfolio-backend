const express = require('express');
const bodyParser = require('body-parser');
const Multer = require('multer');
const {
  getImages,
  addImage,
  getImageMetadata,
  deleteImage,
  getList,
  updateList
} = require('./methods');
const { auth } = require('./auth');

const router = express.Router();
const app = express();
app.use(bodyParser.json());

// Handling files
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

// Routes
router
  .route('/images')
  .get(auth, getImages)
  .post(auth, multer.single('file'), addImage);
router.route('/images/:imageId/data').get(getImageMetadata);
router.route('/images/:imageId').delete(auth, deleteImage);
router
  .route('/image-list')
  .get(getList)
  .post(auth, updateList);

app.use('/api/v1', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
