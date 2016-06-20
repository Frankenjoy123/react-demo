var path = require('path');
var assets = require('./dist/assets/react-demo.json');
var shieldBase = require('./dist/assets/shieldBase.json');
assets.shieldBase = shieldBase.shieldBase;
require(path.resolve(__dirname, 'dist', 'node', 'react-demo', assets['react-demo'].js))(assets);
