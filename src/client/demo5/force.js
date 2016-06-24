import React, { Component } from 'react';
import { pureRender } from './pureRender';
import cc from './style.less';
import _ from 'lodash';
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

@pureRender
class NodeImg extends Component {
  render() {
    const { name, black, width, height, x, y } = this.props;
    return <image className='icon' width={width} height={height} x={x} y={y}
      xlinkHref={require(`./images/${name}${black ? '_black' : ''}.png`)}/>
  }
}

@pureRender
class NodeCircle extends Component {
  render() {
    const { status, x, y, className } = this.props;
    return <circle className={className} r={16} x={x} y={y} stroke={eventStrokes[status]} strokeWidth={6} fill={eventColors[status]}/>
  }
}

@pureRender
class Node extends Component {
  constructor(props) {
    super(props);
  }

  renderEventNode = () => {
    const { fixed, x, y, data } = this.props;
    const { riskStatus, value } = data;
    return (
      <g className={cc.node} transform={`translate(${x}, ${y})`}>
        <NodeCircle className={cc.icon} status={riskStatus} x={0} y={0}/>
        <text textAnchor='middle' dy={30} dataText={value} fillOpacity={1} style={{fill: 'rgb(51, 51, 51)'}}>
          {value}
        </text>
        <NodeImg className={cc.pin} name='key' x={10} y={-13} width={fixed ? 7 : 0} height={fixed ? 9 : 0}/>
      </g>
    );
  }

  renderAttributeNode = () => {
    const { fixed, x, y, data } = this.props;
    const { type, value, black } = data;
    return (
      <g className={cc.node} transform={`translate(${x}, ${y})`}>
        <NodeImg className={cc.icon} name={type}
          black={black}
          x={black ? -20 : -15} y={black ? -20 : -15}
          width={black ? 40 : 30} height={black ? 40 : 30}/>
        <text textAnchor='middle' dy={black ? 38 : 24} dataText={value} fillOpacity={1} style={{fill: 'rgb(51, 51, 51)'}}>
          {value}
        </text>
        <NodeImg className={cc.pin} name='key'
          x={black ? 10 : 8} y={black ? -17 : -11}
          width={fixed ? 7 : 0} height={fixed ? 9 : 0}/>
      </g>
    );
  }

  render() {
    if (this.props.type === EVENT_TYPE) {
      return this.renderEventNode();
    }
    return this.renderAttributeNode();
  }
}

@pureRender
class Link extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { x1, y1, x2, y2 } = this.props;
    return <line className={cc.line} x1={x1} y1={y1} x2={x2} y2={y2}/>
  }
}

@pureRender
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
  }

  componentWillReceiveProps({nodes, links}) {
    const newNodes = _.unionBy(this.state.nodes, nodes, 'uid');
    const newLinks = _.unionWith(this.state.links, links, (s, t) => s.srcUid === t.srcUid && s.descUid === t.descUid);
    newNodes.forEach(node => {
      if (!node.x) {
        node.x = Math.random() * 1000;
      }

      if (!node.y) {
        node.y = Math.random() * 1000;
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
    console.log(nodes, links);
    return <g className='outg'>
      <g>
        {
          links.map(link => <Link key={`${link.srcUid}${link.descUid}`} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2}/>)
        }
      </g>
      <g>
        {
          nodes.map(node => <Node key={node.uid} type={node.type} data={node.data} fixed x={node.x} y={node.y}/>)
        }
      </g>
    </g>;
  }
}
