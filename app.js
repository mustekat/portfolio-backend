const express = require('express');
const basicAuth = require('express-basic-auth');
const request = require('request');
const bodyParser = require('body-parser');
const Multer = require('multer');
const Storage = require('@google-cloud/storage');

const router = express.Router();
const app = express();
app.use(bodyParser.json());

// Instantiate a storage client
const storage = Storage();

const BUCKET_URL = process.env.GCLOUD_STORAGE_BUCKET;
const FOLDER_NAME = process.env.FOLDER_NAME;

const storageUrl = `https://storage.googleapis.com/${BUCKET_URL}/`;
const imageListName = 'image-list.txt';
const filePath = fileName => `${FOLDER_NAME}/${fileName}`;
const fileUrl = fileName => `${storageUrl}/${filePath(fileName)}`;

// Handling files
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});
const bucket = storage.bucket(BUCKET_URL);

// Basic auth
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const auth = basicAuth({
  users: { [USER]: PASSWORD },
  challenge: true,
  realm: BUCKET_URL
});

const getList = (req, res) => {
  request(fileUrl(imageListName), (error, response, body) => {
    const statusCode = response && response.statusCode;
    if (statusCode === 200) {
      const imageList = body.split('\n');
      res.status(200).json({ result: imageList });
      return;
    }
    console.error('ERROR (getList)', statusCode, error, body);
    res.status(statusCode || 500).json({ error, body });
  });
};

const updateList = (req, res) => {
  const list = req.body || [];

  // Create buffer
  const buf = Buffer.from(list.join('\n'));

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(filePath(imageListName));
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: 'text/plain'
    }
  });

  blobStream.on('error', err => {
    console.error('ERROR (updateList):', err);
    res.status(500).send('Error: image list update failed');
  });

  blobStream.on('finish', () => {
    // Return the file name
    res.status(200).send(`Saved image list ${list}`);
  });

  blobStream.end(buf);
};

const addImage = (req, res) => {
  const { file, body } = req;
  if (!file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const fileName = file.originalname;
  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(filePath(fileName));
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      metadata: { ...body },
      contentType: file.mimetype
    }
  });

  blobStream.on('error', err => {
    console.error('ERROR (addImage):', err);
    res.status(500).send('Error: file upload failed');
  });

  blobStream.on('finish', () => {
    // Return the file name
    res
      .status(200)
      .send(
        `Uploaded ${file.originalname} (${file.mimetype}) to ${filePath(
          fileName
        )}`
      );
  });

  blobStream.end(file.buffer);
};

const getImageMetadata = (req, res) => {
  const fileName = req.params.imageId;
  if (!fileName) {
    res.status(400).send('No file name given.');
    return;
  }

  bucket
    .file(filePath(fileName))
    .getMetadata()
    .then(results => {
      const metadata = results[0];
      res.status(200).json({
        result: {
          fileName,
          updated: metadata.updated,
          ...metadata.metadata
        }
      });
    })
    .catch(err => {
      console.error('ERROR (getImageMetadata):', err);
      res.status(500).send('Error: get metadata failed');
    });
};

const getImages = (req, res) => {
  bucket
    .getFiles()
    .then(results => {
      const files = results[0];
      const fileNames = files.reduce((list, file) => {
        const { name } = file;
        const pathStart = filePath('');
        if (name.startsWith(pathStart) && name !== pathStart) {
          const fileName = name.slice(pathStart.length);
          if (fileName !== imageListName) {
            list.push(fileName);
          }
        }
        return list;
      }, []);
      res.status(200).json({
        result: fileNames
      });
    })
    .catch(err => {
      console.error('ERROR (getImages):', err);
      res.status(500).send('Error: get images failed');
    });
};

const deleteImage = (req, res) => {
  const fileName = req.params.imageId;
  if (!fileName) {
    res.status(400).send('No file name given.');
    return;
  }

  bucket
    .file(filePath(fileName))
    .delete()
    .then(() => {
      res.status(200).send(`Deleted ${filePath(fileName)}`);
    })
    .catch(err => {
      console.error('ERROR (deleteImage):', err);
      res.status(500).send('Error: file delete failed');
    });
};

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
