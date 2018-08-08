# portfolio-backend

This is a simple backend designed to run in Google App Engine for a portfolio website. Uses Node.js and express.

Uses Google Cloud storage public bucket provided with the App Engine for storing files and their metadata. Files are stored in a different folder depending on the environment. In addition to the image files, a file (`image-list.txt`) is used for storing the information of which images and in which order to show in the public portfolio site. Includes also methods for a password-protected admin site for managing the images.

## Start developing
Install [Google Cloud Tools](https://cloud.google.com/sdk/docs/).

Copy `.env.sample`into `.env` and fill with your values used in development. Similarly, copy `app.sample.yaml` into `app.yaml`and fill with values used in production. The App Engine will automatically set some values, e.g. `NODE_ENV` as `production` and `PORT` as `8080`;

    source .env

    yarn install

## Development

    yarn start-dev

The api is served from [localhost:8080/api/v1/](localhost:8080/api/v1) if you are using the default settings.

## Deploying to App Engine

    yarn deploy


## Versions

v0.1 is just an api with endpoints.

v0.2 introduces a GUI at `'/'` for using the admin endpoints
