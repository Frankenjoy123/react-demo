import React, { Component } from 'react';
import { pureRender } from './pureRender';
import cc from './style.less';
import _ from 'lodash';
import * as PubSub from './pubsub';
const EVENT_TYPE = 1;
const ATTRIBUTE_TYPE = 2;
const eventColors = {
  Accept:'#bad6ec',
  Review:'#75acd9',
  Reject:'#1974bf',
};
const eventStrokes = {
  Accept: 'rgba(186,214,236,.2)',
  Review: 'rgba(117,172,217,.2)',
  Reject: 'rgba(25,116,191,.2)',
}

const noop = () => {};

function NodeImg({ name, black, width, height, x, y, onClick }) {
  return <image className='icon' width={width} height={height}
    x={x} y={y}
    xlinkHref={require(`./images/${name}${black ? '_black' : ''}.png`)}
    onClick={onClick || noop}/>;
}

function NodeCircle({ status, x, y, className }) {
  return <circle className={className} r={16}
    x={x} y={y}
    stroke={eventStrokes[status]}
    strokeWidth={6}
    fill={eventColors[status]}/>
}

class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    }
  }

  releaseNode = uid => () => {
    PubSub.dispatch('toggleFixed', {uid, fixed: false});
  }

  onDragStart = fixed => e => {
    e.preventDefault();
    this.setState({ dragging: true, clientX: e.clientX, clientY: e.clientY });
  }

  onDrag = uid => e => {
    e.preventDefault();
    if (this.state.dragging) {
      PubSub.dispatch('move', { uid, offset: {
          x: e.clientX - this.state.clientX, y: e.clientY - this.state.clientY
        }
      });
      this.setState({ clientX: e.clientX, clientY: e.clientY });
    }
  }

  onDragEnd = uid => e => {
    e.preventDefault();
    this.setState({ dragging: false, clientX: e.clientX, clientY: e.clientY });
    PubSub.dispatch('toggleFixed', { uid, fixed: true });
  }

  renderEventNode = () => {
    const { node } = this.props;
    const { fixed, x, y } = node;
    const { riskStatus, value } = node.data;
    return (
      <g className={cc.node} transform={`translate(${x}, ${y})`}
        onMouseDown={this.onDragStart(node.fixed).bind(this)}
        onMouseMove={this.onDrag(node.uid, node.fixed).bind(this)}
        onMouseUp={this.onDragEnd(node.uid, node.fixed).bind(this)}
        >
        <NodeCircle className={cc.icon} status={riskStatus} x={0} y={0}/>
        <text className={cc.unselectable} textAnchor='middle' dy={30} dataText={value} fillOpacity={1} style={{fill: 'rgb(51, 51, 51)'}}>
          {value}
        </text>
        <NodeImg className={cc.pin} name='key' x={10} y={-13}
          width={fixed ? 7 : 0} height={fixed ? 9 : 0}
          onClick={this.releaseNode(node.uid)}/>
      </g>
    );
  }

  renderAttributeNode = () => {
    const { node } = this.props;
    const { fixed, x, y } = node;
    const { type, value, black } = node.data;
    return (
      <g className={cc.node} transform={`translate(${x}, ${y})`}
        onMouseDown={this.onDragStart(node.fixed).bind(this)}
        onMouseMove={this.onDrag(node.uid, node.fixed).bind(this)}
        onMouseUp={this.onDragEnd(node.uid, node.fixed).bind(this)}
        >
        <NodeImg className={cc.icon} name={type}
          black={black}
          x={black ? -20 : -15} y={black ? -20 : -15}
          width={black ? 40 : 30} height={black ? 40 : 30}/>
        <text className={cc.unselectable} textAnchor='middle' dy={black ? 38 : 24} dataText={value} fillOpacity={1} style={{fill: 'rgb(51, 51, 51)'}}>
          {value}
        </text>
        <NodeImg className={cc.pin} name='key'
          x={black ? 10 : 8} y={black ? -17 : -11}
          width={fixed ? 7 : 0} height={fixed ? 9 : 0}
          onClick={this.releaseNode(node.uid)}/>
      </g>
    );
  }

  render() {
    if (this.props.node.type === EVENT_TYPE) {
      return this.renderEventNode();
    }
    return this.renderAttributeNode();
  }
}

function Link({ x1, y1, x2, y2 }) {
  return <line className={cc.line} x1={x1} y1={y1} x2={x2} y2={y2}/>
}

export default class Force extends Component {
  constructor(props) {
    super(props);
    const { nodes, links } = props;
    nodes.forEach(node => {
      if (!node.x) {
        node.x = Math.random() * 1000;
      }

      if (!node.y) {
        node.y = Math.random() * 1000;
      }
    });
    links.forEach(link => {
      const source = nodes.find(node => node.uid === link.srcUid);
      const target = nodes.find(node => node.uid === link.descUid);
      link.x1 = source.x;
      link.y1 = source.y;
      link.x2 = target.x;
      link.y2 = target.y;
    });
    this.state = {
      nodes: nodes,
      links: links,
    };
    PubSub.subscribe('toggleFixed', ({uid, fixed}) => {
      const newNodes = _.cloneDeep(this.state.nodes);
      const node = newNodes.find(node => node.uid === uid);
      node.fixed = fixed;
      this.setState({nodes: newNodes});
    });
    PubSub.subscribe('move', ({uid, offset}) => {
      const newNodes = _.cloneDeep(this.state.nodes);
      const node = newNodes.find(node => node.uid === uid);
      node.x += offset.x;
      node.y += offset.y;
      const newLinks = _.cloneDeep(this.state.links);
      newLinks.forEach(link => {
        if (link.srcUid === uid) {
          link.x1 = node.x;
          link.y1 = node.y;
        }
        if (link.descUid === uid) {
          link.x2 = node.x;
          link.y2 = node.y;
        }
      })
      this.setState({nodes: newNodes, links: newLinks});
    });
  }

  componentWillReceiveProps({nodes, links}) {
    const newNodes = _.unionBy(this.state.nodes, nodes, 'uid');
    const newLinks = _.unionWith(this.state.links, links, (s, t) => s.srcUid === t.srcUid && s.descUid === t.descUid);
    newNodes.forEach(node => {
      if (!node.x) {
        node.x = Math.random() * 1000;
      }

      if (!node.y) {
        node.y = Math.random() * 500;
      }
    });
    newLinks.forEach(link => {
      const source = newNodes.find(node => node.uid === link.srcUid);
      const target = newNodes.find(node => node.uid === link.descUid);
      link.x1 = source.x;
      link.y1 = source.y;
      link.x2 = target.x;
      link.y2 = target.y;
    });
    this.setState({nodes: newNodes, links: newLinks});
  }

  render() {
    const { nodes, links } = this.state;
    return <g className='outg'>
      <g>
        {
          links.map(link => <Link key={`${link.srcUid}${link.descUid}`} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2}/>)
        }
      </g>
      <g>
        {
          nodes.map(node => <Node key={node.uid} node={node}/>)
        }
      </g>
    </g>;
  }
}
