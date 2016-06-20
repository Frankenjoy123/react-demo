/**
 * Created by yzf on 16/5/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const items = ['Item 0', 'Item 1'];

function main() {
  ReactDOM.render(<App items={items} />, document.getElementById('content'));
}

main();
