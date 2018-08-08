const request = require('request');
const Storage = require('@google-cloud/storage');

// Instantiate a storage client
const storage = Storage();

const BUCKET_URL = process.env.GCLOUD_STORAGE_BUCKET;
const FOLDER_NAME = process.env.FOLDER_NAME;

const storageUrl = `https://storage.googleapis.com/${BUCKET_URL}`;
const imageListName = 'image-list.txt';
const filePath = fileName => `${FOLDER_NAME}/${fileName}`;
const fileUrl = fileName => `${storageUrl}/${filePath(fileName)}`;

const bucket = storage.bucket(BUCKET_URL);

const getList = (req, res, next) => {
  request(fileUrl(imageListName), (error, response, body) => {
    const statusCode = response && response.statusCode;
    if (statusCode === 200) {
      res.locals.list = body.split('\n');
      return next();
    }
    console.error('ERROR (getList)', statusCode, error, body);
  });
};

const respondList = (req, res) => {
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
  const { list: listStr } = req.body;
  const list = listStr.split(',');

  // Create buffer
  const buf = Buffer.from(list.join('\n'));

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(filePath(imageListName));
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: 'text/plain',
      cacheControl: 'no-cache, no-store, must-revalidate'
    }
  });

  blobStream.on('error', err => {
    console.error('ERROR (updateList):', err);
    res.status(err.code || 500).send('Error: image list update failed');
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
      contentType: file.mimetype,
      cacheControl: 'public, max-age=1800'
    }
  });

  blobStream.on('error', err => {
    console.error('ERROR (addImage):', err);
    res.status(err.code || 500).send('Error: file upload failed');
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
  const { fileName } = req.params;
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
      res.status(err.code || 500).send('Error: get metadata failed');
    });
};

const getImages = (req, res, next) => {
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
      res.locals.images = fileNames;
      return next();
    })
    .catch(err => {
      console.error('ERROR (getImages):', err);
    });
};

const deleteImage = (req, res) => {
  const { fileName } = req.params;
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
      res.status(err.code || 500).send('Error: file delete failed');
    });
};

module.exports = {
  getImages,
  addImage,
  getList,
  respondList,
  updateList,
  deleteImage,
  getImageMetadata
};
