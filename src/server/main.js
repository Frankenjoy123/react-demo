import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import gjj from './routers/gjj';
import path from 'path';
import Select from '../client/demo4/select';
import React from 'react';
import { renderToString } from 'react-dom/server';
function render(config, name) {
  return require(`./views/${name}.html.est`)(config);
}

function main(assets) {
  const config = {
    host: 'localhost',
    port: 3001,
    public: 'http://localhost:3000',
    static: 'http://localhost:3000/s',
    assets,
  };
  const app = new express();

  app.use('/s', express.static(path.resolve(process.cwd(), 'dist', 'web')));
  app.use(express.static(path.resolve(process.cwd(), 'images')));
  app.use(express.static(path.resolve(process.cwd(), 'lib')));
  app.use(express.static(path.resolve(process.cwd(), 'node_modules/shieldBase/dist/web/shieldBase')));
  app.use('/', bodyParser.json(), cookieParser());
  app.use('/demo4', (req, res) => {
    config.markup = renderToString(<Select />);
    res.send(render(config, 'demo4'));
  });

  app.use('/:name', (req, res) => {
    res.send(render(config, req.params.name));
  });

  http.createServer(app).listen(config.port);
}

module.exports = main;
