/**
 * Created by yzf on 16/5/16.
 */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Input from './Input';
import cc from './style.less';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <ul>
          {
            this.props.items.map(item =>
              <li key={item}>
                <span>{item}</span>
                <Input type="text" placeholder={item} ref={item}/>
                <button className={cc.button} onClick={() => ReactDOM.findDOMNode(this.refs[item]).focus()}>focus {item}</button>
              </li>
            )
          }
        </ul>
      </div>
    )
  }
};
