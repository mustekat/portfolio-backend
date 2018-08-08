const express = require('express');
const bodyParser = require('body-parser');
const Multer = require('multer');
const cors = require('cors');
const {
  getImages,
  addImage,
  getImageMetadata,
  deleteImage,
  getList,
  updateList,
  respondList
} = require('./methods');
const { auth } = require('./auth');

const apiPath = '/api/v1';

const router = express.Router();
const app = express();
app.use(bodyParser.json());
app.set('view engine', 'pug');

// Handling files and multipart/form-data
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

// CORS for public get urls
const CORS_WHITELIST = process.env.CORS_WHITELIST;
const corsWhitelist = (CORS_WHITELIST && CORS_WHITELIST.split(',')) || [];
const corsOptions = {
  origin: (origin, callback) => {
    const allowCors = corsWhitelist.indexOf(origin) !== -1;
    callback(null, allowCors);
  },
  methods: 'GET'
};

// Routes
router.route('/images').post(auth, multer.single('file'), addImage);
router.route('/images/:fileName/data').get(cors(corsOptions), getImageMetadata);
router.route('/images/:fileName').delete(auth, deleteImage);
router
  .route('/image-list')
  .get(cors(corsOptions), respondList)
  .post(auth, multer.fields([]), updateList);

app.use(apiPath, router);

// Display a page with forms for using the admin endpoints
app.use('/static', express.static('static'));
app.use('/', auth, getList, getImages, (req, res) =>
  res.render('index.pug', { apiPath })
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
