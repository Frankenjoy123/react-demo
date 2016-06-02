/**
 * Created by yzf on 16/5/30.
 */

import React, {Component} from 'react';

function fixValue(value) {
  return !value ? '' : value;
}

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = {...this.props};
    switch (props.type) {
      case 'textarea':
        return (
          <textarea {...props}/>
        );
      default:
        return (
          <input {...props}/>
        );
    }
  }
}
