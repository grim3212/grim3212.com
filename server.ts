import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import * as compression from 'compression';
import * as request from 'request';
import { join } from 'path';
import { readFileSync } from 'fs';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();
app.use(compression());

const PORT = process.env.PORT || 5000;
const DIST_FOLDER = join(process.cwd(), 'dist');

const STEAM_KEY = process.env.steamKey || "";

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

app.get('/api/steam/CollectionDetails/:collectionID', (req, res) => {
	var url = `https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/`;
	
	request.post(url, {form: {key: STEAM_KEY, collectioncount: 1, publishedfileids: [ req.params.collectionID ]}}, (err, steamRes, body) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(body);
	});
	
});

app.get('/api/steam/WorkshopDetails/:workshopID', (req, res) => {
	var url = `https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/`;
	
	request.post(url, {form: {key: STEAM_KEY, itemcount: 1, publishedfileids: [ req.params.workshopID ]}}, (err, steamRes, body) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(body);
	});
	
});

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
