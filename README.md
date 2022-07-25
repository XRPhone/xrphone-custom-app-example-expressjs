# **XRPhone Custom App Example Express.js**

# Overview

This XRPhone custom app demonstrates a simple example of how how to communicate with XRPhone using [Express.js](https://expressjs.com) which is powered by [Node.js](https://nodejs.org) (server-side JavaScript) runtime.

XRPhone custom apps are made by developers who wish to connect external invoice accounting based platforms/databases to XRPhone. These apps can then be added by XRPhone merchants to enable their customers to lookup and apply payments using XRP via XUMM wallet. 

# Core dependencies
- Auth0 (Free account)
- TypeScript
- Node.js
- Express.js
- MongoDB Memory Server 
- Mongoose
- XRPhone SDK

# Prerequisites

> **NOTE**: Currently the XRPhone Developer Portal is unreleased. To obtain early access contact XRPhone directly.

- Created developer account on the https://developer.xrphone.app portal.
- Created app on developer portal. This is where you get the apps API Key & API Secret.
- Obtained access to the `xrphone-sdk-nodejs` https://github.com/xrphone/xrphone-sdk-nodejs

# How does it work?

XRPhone apps are created on the XRPhone developer portal. When XRPhone apps are called using their associated webhook callback url, the request includes the header `X-XRPhone-Topic`. The **"topic"** is the type of webhook event that the current XRPhone request is awaiting a response for. 

When the XRPhone enabled customer attempts to lookup the merchants invoice, XRPhone will contact the external app via POST webhook call to obtain the most up to date invoice balance for the requested invoice number. 

XRPhone will contact the external app via POST webhook call with details regarding the completed XRPL transaction payment details. The custom app will then apply the payment to the associated invoice in the external system to keep the external systems accounting up-to-date and automatically synced.

# Sample test database

This example app utilizes the npm package `mongodb-memory-server`. This provides a temporary in-memory MongoDB server that this sample app will connect. 

Whenever you restart this app server process the MongoDB memory server is reset and the starter mock data will be re-inserted into the database. The data is only temporarily stored in memory and is not persisted. In a real production application you would persist to your favorite NoSQL/SQL database engine.

The initial starter mock data can be found in `/db/mocks/accounting.mock.ts`.

> The sample database/mock-data should only used for demonstration purposes. They are not production ready. This example app should only be used to provide basic example of how the XRPhone custom app request/response cylce works.

When this server app example loads it will output the local `mongodb://` test address. This is where the temporary test sample database lives. If you would like to play around with the data you can use this temporary mongo connection. 

Connecting directly to the local MongoDB can be helpful if you are interested to view the invoice data being updated after payments are applied. Take note of the port number because it can change on subsequent app restarts.

This app will create a Mongo database `test` with a collection **Accounting** `accountings`. This is the collection that will contain the sample invoice data.

## Setup

```shell
npm install
```

## Development

Concurrently runs the TypeScript compiler in watch mode while also running nodemon to watch the outputted `/dist/server.js`.

> By default the server will run on port 3000.

```
npm run dev
```

## Build

First cleans any old existing `/dist` folder then runs TypeScript compiler to generate fresh build which outputs to the `/dist` folder.

```
npm run Build
```

# Need help?

Please visit https://docs.xrphone.app

# Learn more
- https://xrphone.app
- https://twitter.com/XRPhoneOfficial
