import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import gjj from './routers/gjj';
import path from 'path';

function render(config, name) {
  return require(`./views/${name}.html.est`)(config);
}

function main(assets) {
  const config = {
    host: 'localhost',
    port: 3000,
    public: 'http://localhost:3000',
    static: 'http://localhost:3000/s',
    assets,
  };
  const app = new express();

  app.use('/s', express.static(path.resolve(process.cwd(), 'dist', 'web')));
  app.use(express.static(path.resolve(process.cwd(), 'images')));
  app.use(express.static(path.resolve(process.cwd(), 'lib')));
  app.use('/', bodyParser.json(), cookieParser());

  app.use('/:name', (req, res) => {
    res.send(render(config, req.params.name));
  });

  http.createServer(app).listen(config.port);
}

module.exports = main;
