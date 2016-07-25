import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import gjj from './routers/gjj';
import path from 'path';
import Select from '../client/demo4/select';
import React from 'react';
import { renderToString } from 'react-dom/server';
import dataReader from './dataReader';
function render(config, name) {
  return require(`./views/${name}.html.est`)(config);
}
function main(assets) {
  const config = {
    host: 'localhost',
    port: 3001,
    public: 'http://localhost:3001',
    static: 'http://localhost:3001/s',
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
  app.get('/data', (req, res) => {
    const or = req.query.or;
    const data = dataReader(path.resolve(process.cwd(), `src/server/${or || 'test2'}`));
    res.json(data);
  });

  app.use('/:name', (req, res) => {
    res.send(render(config, req.params.name));
  });

  http.createServer(app).listen(config.port);
}

module.exports = main;
