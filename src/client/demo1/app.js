/**
 * Created by yzf on 16/5/16.
 */
import React, { Component } from 'react';
export default class App extends Component {

  constructor(props) {
    super(props);
    this.render = this.render.bind(this);
    this.state = {
      items: this.props.items,
      disabled: true
    };
  }

  componentDidMount() {
    this.setState({
      disabled: false
    });
  }

  addItem = () => {
    this.setState({
      items: this.state.items.concat('Item ' + this.state.items.length)
    });
  };

  removeItem = () => {
    this.setState({
      items: this.state.items.slice(0, this.state.items.length - 1)
    });
  };

  render() {
    return (
      <div>
        <button onClick={this.addItem} disabled={this.state.disabled}>Add Item</button>
        <button onClick={this.removeItem} disabled={this.state.disabled}>Remove Item</button>
        <ul>
          {
            this.state.items.map(item => <li key={item}>{item}</li>)
          }
        </ul>
      </div>
    )
  }
};
