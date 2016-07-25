import './style.less';
import echarts from 'echarts';
import 'whatwg-fetch';

const chart = echarts.init(document.getElementById('content'));
chart.showLoading();
fetch('/data').then(res => res.json()).then(data => {
  const option = {
    series: [{
      type: 'graph',
      layout: 'force',
      animation: false,
      label: {
        normal: {
          position: 'top',
          formatter: '{b}'
        }
      },
      roam: true,
      draggable: true,
      data: data.nodes,
      categories: data.categories,
      force: {
        initLayout: 'circular',
        // gravity: 0.05,
        edgeLength: 20,
        repulsion: 50
      },
      edges: data.edges
    }]
  };
  chart.setOption(option);
  chart.hideLoading();
});
