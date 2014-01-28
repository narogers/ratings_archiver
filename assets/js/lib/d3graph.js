var D3UTILS = D3UTILS || {}

D3UTILS.D3Graph = function() 
{
  // Setting up defaults here
  var svg_dimensions = {
     width: 960,
     height: 500,
     margin: 30,
  };

  // Other variables that need to be tracked but are calculated when the
  // init() method is called
  var bar_dimensions = [],
      data = [],
      options = [],
      chart,
      bars, 
      labels,
      bar_xscale, 
      bar_yscale;
      
  init = function(defaults) {
    options = defaults;
    svg_dimensions = {
      height: options['svg_height'] || 500, 
      width: options['svg_width'] || 960, 
      margin: options['svg_margin'] || 30
    };
    data = options['data'] || []

    bar_dimensions = {
      width: Math.floor((svg_dimensions['width'] - svg_dimensions['margin'] * 2) / data.length)
    }

    bar_xscale = d3.scale.linear()
      .domain([
        d3.min(data, function(d) { return d['x'] }),
        d3.max(data, function(d) { return d['x'] })
      ])
      .rangeRound([
        svg_dimensions['margin'],
        svg_dimensions['width'] - bar_dimensions['width']
      ])
      .nice();
    bar_yscale = d3.scale.linear()
      .domain([
        0,
        d3.max(data, function(d) { return d['y'] })
      ])
      .rangeRound([
        svg_dimensions['height'] - svg_dimensions['margin'],
        svg_dimensions['margin']])
      .nice()
   
    return true;
  },

  render = function(element) {
    chart = d3.select(element)
      .append('svg')
      .attr('id', 'ratings_distribution')
      .attr('height', svg_dimensions['height'])
      .attr('width', svg_dimensions['width']);
    

    xAxis = applyXAxis();
    yAxis = applyYAxis();
    bars = drawBars(data);
  },

  refresh = function(newData) {
    data = newData;
    duration = options['duration'] || 500;

    bars.data(data)
      .transition()
      .duration(duration)
      .attr('y', function(d, i) {
        return bar_yscale(d['y']);
      })
      .attr('height', function(d) {
        return (svg_dimensions['height'] - bar_yscale(d['y']) - svg_dimensions['margin']);
      }) 
  },

  // Private functions
  drawBars = function() {
    graph_values = chart.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')

    graph_values.attr('width', bar_dimensions['width'])
      .attr('height', function(d) {
        return (svg_dimensions['height'] - bar_yscale(d['y']) - 
          svg_dimensions['margin']);
      }) 
      .attr('x', function(d, i) { return bar_xscale(d['x']); })
      .attr('y', function(d, i) { return bar_yscale(d['y']); })
      .attr('fill', 'teal')
      .classed('graph', true)
  
      return graph_values 
  },

  applyXAxis = function() { 
    ticks = options['ticks'] || 5;
 
    var xAxis = d3.svg.axis()
      .scale(bar_xscale)
      .orient('bottom');

    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0, ' + 
        (svg_dimensions['height'] - svg_dimensions['margin']) +
        ')')
      .call(xAxis);
    return xAxis;
  },
  
  applyYAxis = function() {
    ticks = options['ticks'] || 5;

    var yAxis = d3.svg.axis()
      .scale(bar_yscale)
      .orient('left')
      .ticks(ticks);
    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + svg_dimensions['margin'] +
        ', 0)')
      .call(yAxis)
    return yAxis;
  };

  return {
    init: init,
    render: render,
    refresh: refresh,
  };  
};
