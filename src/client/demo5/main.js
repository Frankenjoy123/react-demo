import Force from './force';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const nodes = [{
  uid: 1,
  data: {
    riskStatus: 'Accept',
    value: 'test1',
  },
  type: 1,
}, {
  uid: 2,
  data: {
    black: true,
    type: 'qqNumber',
    value: '348267823',
  },
  type: 2
},{
  uid: 3,
  data: {
    black: false,
    type: 'accountMobile',
    value: '15191411451',
  },
  type: 2
}];
const links = [{
  srcUid: 2,
  descUid: 1
}, {
  srcUid: 3,
  descUid: 1,
}];

class App extends Component {
  render() {
    return <svg width={1153} height={1000}>
      <Force nodes={nodes} links={links}/>
    </svg>
  }
}

ReactDOM.render(<App />, document.getElementById('content'));
