var path = require('path');
var assets = require('./dist/assets/react-demo.json');
require(path.resolve(__dirname, 'dist', 'node', 'react-demo', assets['react-demo'].js))(assets);
