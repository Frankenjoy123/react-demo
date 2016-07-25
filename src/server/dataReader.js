import _ from 'lodash';
import fs from 'fs';
function readEdges(data) {
  return data.split('\n').slice(1, -1).map(line => {
    const temp = line.split(' ');
    return {
      source: temp[0],
      target: temp[1],
    };
  });
}

function readNodes(data, categories) {
  return data.split('\n').slice(1, -1).map(line => {
    const temp = line.split(' ');
    categories.add(temp[2]);
    return {
      name: temp[0],
      score: parseInt(temp[1]),
      category: temp[2],
      flag: temp[3] == 1,
    };
  });
}

export default function readData(file) {
  const clusters = new Set();
  const edges = readEdges(fs.readFileSync(`${file}.edge`, 'utf8'));
  const nodes = readNodes(fs.readFileSync(`${file}.node`, 'utf8'), clusters);
  const categories = [...clusters].map(category => {return {name: category}});
  const links = _(edges).map(edge => {
    return {
      source: nodes.find(node => node.name == edge.source),
      target: nodes.find(node => node.name == edge.target),
    };
  })
  .filter(edge => edge.source.category != edge.target.category)
  .groupBy(edge => _([edge.source.category, edge.target.category]).sort().value())
  .map(group => {
    const st = _([group[0].source.category, group[0].target.category]).sort().value();
    return {
      source: st[0],
      target: st[1],
      score: group.length,
    };
  })
  .value();
  const result = {
    edges,
    nodes,
    categories,
    links,
  };
  // fs.writeFile(`${file}.json`, JSON.stringify(result));
  return result;
}
