import './style.less';
import 'whatwg-fetch';
import './style.less';
import d3 from 'd3';
import _ from 'lodash';
window._ = _;
const fill = (() => {
  const c1 = d3.scale.category20();
  const c2 = d3.scale.category20b();
  const c3 = d3.scale.category20c();
  const colors = [];
  for(let i = 0;i < 20;i++) {
    colors.push(c1(i));
    colors.push(c2(i));
    colors.push(c3(i));
  }
  return index => colors[index % colors.length];
})();

function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}
const or = getQueryString('or');

function filterCageories(categories) {
  data.categories = _(data.categories).filter(({name}) => categories.find(item => item == name)).sortBy('nums').reverse().value();
  data.nodes = _(data.nodes).filter(({category}) => categories.find(item => item == category)).value();
  data.edges = _(data.edges).filter(({source, target}) => data.nodes.find(node => node.name == source) && data.nodes.find(node => node.name == target)).value();
  data.links = _(data.links).filter(({source, target}) => _.difference([source, target], categories).length == 0).value();
}

function topCageories(top) {
  const categories = _(data.categories).sortBy('nums').map(item => item.name).slice(-top).value();
  filterCageories(categories);
}

function legend(categories) {
  const bar = document.getElementById('bar');
  categories.forEach((category, i) => {
    const color = fill(category.name);
    const label = `团伙${i + 1}(${category.nums})`;
    const legend = document.createElement('div');
    legend.setAttribute('class', 'legend');
    const icon = document.createElement('div');
    icon.style.backgroundColor = color;
    const span = document.createElement('span');
    span.innerHTML = label;
    legend.appendChild(icon);
    legend.appendChild(span);
    bar.appendChild(legend);
  });
}

fetch(`/data?or=${or || 'test2'}`).then(res => res.json()).then(data => {
  window.data = data;
  const width = 1400;
  const height = 700;
  const svg = d3.select('#content').append('svg').attr({
    width,
    height,
    id: 'svg'
  }).append('svg:g').attr('class', 'outg');
  const zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', () => svg.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`));
  d3.select('#svg').call(zoom);
  data.categories.forEach(category => {
    category.radius = 0;
    data.nodes.forEach(node => {
      node.radius = (node.score < 8 ? 8 : (node.score < 15 ? node.score * 2 : (node.score < 30 ? node.score * 1.5 : 45))) / 2;
      if (node.category == category.name) {
        node.center = category;
        category.radius++;
      }
    });
    category.nums = category.radius;
    category.radius = Math.min(category.radius * 2 + 20, Math.max(data.nodes.length / data.categories.length, 90));
  });
  const top = getQueryString('top');
  const filter = getQueryString('filter');
  if (top) {
    topCageories(top);
  }
  if (filter) {
    filterCageories(_.split(filter, ','));
  }
  data.links = _(data.links).map(link => {
    link.source = data.categories.find(category => category.name == link.source);
    link.target = data.categories.find(category => category.name == link.target);
    return link;
  }).value();
  legend(data.categories);
  const svgLink = svg.append('svg:g').attr('class', 'links');
  const svgNode = svg.append('svg:g').attr('class', 'nodes');
  data.edges.map(edge => {
    edge.source = data.nodes.findIndex(node => node.name == edge.source);
    edge.target = data.nodes.findIndex(node => node.name == edge.target);
  });
  const force = d3.layout.force()
    .nodes(data.nodes)
    .links(data.edges)
    .size([width, height])
    .charge(-50)
    .on('start', () => {
      svgLink.selectAll('line').data(data.edges).enter()
        .append('line').attr('stroke', '#ccc').attr('stroke-width', 1);
      svgNode.selectAll('circle').data(data.nodes).enter()
        .append('circle')
        .attr("class", "node")
        .attr('category', d => d.category)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.radius)
        .style("fill", d => d.flag ? fill(d.category) : 'red')
        .style("stroke", d => d3.rgb(fill(d.category)).darker(2));
    });

  const groups = d3.nest().key(d => { return d.category; }).entries(data.nodes);
  const groupPath = d => {
      return "M" +
        d3.geom.hull(d.values.map(function(i) { return [i.x, i.y]; }))
          .join("L")
      + "Z";
    };
  // 设置团伙中心
  function cluster(alpha) {
    return o => {
      o.y += (o.center.y - o.y) * alpha;
      o.x += (o.center.x - o.x) * alpha;
      // const a = o.center.y - o.y;
      // const b = o.center.x - o.x;
      // const r = Math.abs(Math.sqrt(a * a + b * b));
      // if (r > o.center.radius) {
      //   o.y = o.center.y + a * r / o.center.radius;
      //   o.x = o.center.x + a * r / o.center.radius;
      // }
    }
  }
  // 避免节点碰撞
  function collipe(alpha, nodes, padding) {
    var quadtree = d3.geom.quadtree(nodes);
    return d => {
      const rb = 2 * d.radius + padding,
      nx1 = d.x - rb,
      nx2 = d.x + rb,
      ny1 = d.y - rb,
      ny2 = d.y + rb;
      quadtree.visit((quad, x1, y1, x2, y2) => {
        if (quad.point && (quad.point !== d)) {
        let x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
            l = (l - rb) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  force.on('tick', e => {
    svgNode.selectAll('circle')
      .each(cluster(data.categories.length / 2 * e.alpha))
      .each(collipe(.5, data.nodes, (data.nodes.length > 1000 ? 1 : 10)))
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
    svgNode.selectAll("path")
      .data(groups)
      .attr("d", groupPath)
      .enter().insert("path", "circle")
      .style("fill", d => fill(d.key))
      .style("stroke", d => fill(d.key))
      .style("stroke-width", 40)
      .style("stroke-linejoin", "round")
      .style("opacity", .2)
      .attr("d", groupPath);
    svgLink.selectAll('line').attr("x1",d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    const factor = height / (_.maxBy(data.nodes, 'x').x - _.minBy(data.nodes, 'x').x + 300);
    const translateX = width / 2 * (1 - factor);
    const translateY = height / 2 * (1 - factor);
    zoom.scale(factor).translate([translateX,translateY]).event(svg);
  });
  const cForce = d3.layout.force()
    .nodes(data.categories)
    // .links(data.links)
    .size([width, height])
    .charge(Math.min(Math.max(-800, -60 * data.categories.length), -data.nodes.length / data.categories.length))
    .on('start', () => force.start())
    .on('tick', e => {
      data.categories.forEach(collipe(.5, data.categories, 30));
    });
  cForce.start();
});
