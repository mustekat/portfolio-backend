const express = require('express');
const request = require('request');

const router = express.Router();
const app = express();

const APP_URL = process.env.APP_URL;
const FOLDER_NAME = process.env.FOLDER_NAME;

const storageUrl = `https://storage.googleapis.com/${APP_URL}/${FOLDER_NAME}`;
const imageListUrl = `${storageUrl}/image-list.txt`;
const imageUrl = fileName => `${storageUrl}/${fileName}`;

const getList = (req, res, next) => {
  request(imageListUrl, (error, response, body) => {
    const statusCode = response && response.statusCode;
    if (statusCode === 200) {
      const imageList = body.split('\n');
      res.status(200).json({ result: imageList });
    } else {
      console.error('Error in getList', statusCode, error, body);
      res.status(statusCode || 500).json({ error, body });
    }
  });
};

const updateList = (req, res, next) => {
  res.status(200).send('Dummy response for update list');
};

const addImage = (req, res, next) => {
  res.status(200).send('Dummy response for add image');
};

const deleteImage = (req, res, next, id) => {
  res.status(200).send(`Dummy response for delete ${id}`);
};

router.route('/images').post(addImage);

router.route('/images/:imageId').delete(deleteImage);

router
  .route('/image-list')
  .get(getList)
  .post(updateList);

app.use('/api/v1', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
