# portfolio-backend

This is a simple backend designed to run in Google App Engine for a portfolio website.

## Start developing
Install [Google Cloud Tools](https://cloud.google.com/sdk/docs/).

Copy `.env.sample`into `.env` and fill with your values used in development. Similarly, copy `app.sample.yaml` into `app.yaml`and fill with values used in production. The App Engine will automatically set some values, e.g. `NODE_ENV` as `production` and `PORT` as `8080`;

    source .env

    yarn install

## Development

    yarn start-dev

Go to [localhost:8080](localhost:8080) if you are using the default port.

## Deploying to App Engine

    yarn deploy
