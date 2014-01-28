var D3UTILS = D3UTILS || {}

D3UTILS.D3Graph = function() 
{
  // Other variables that need to be tracked but are calculated when the
  // init() method is called
  var configuration = [],
    data = [],
    elements = [],
    scales = [];
      
  init = function(settings) {
    configuration.svg = {
      height: settings.height || 500, 
      width: settings.width || 960, 
      margin: settings.margin || 20
    };
    configuration.chart = {
      height: configuration.svg.height - (configuration.svg.margin * 2),
      width: configuration.svg.width - (configuration.svg.margin * 2)
    }

    data = settings.data || []
    elements.container = settings.element || 'body'
    
    // When we go to render we will translate the entire graph so there
    // is no need to make adjustments based on the margins at this
    // point.
    //
    // See http://bl.ocks.org/mbostock/3019563 for more details
    configuration.bar = {
      width: Math.floor(configuration.chart.width / data.length)
    }

    scales.xScale = d3.scale.linear()
      .domain([
        d3.min(data, function(d) { return d['x'] }),
        d3.max(data, function(d) { return d['x'] })
      ])
      .range([
        0,       
        configuration.chart.width - configuration.bar.width
      ])
   scales.yScale = d3.scale.linear()
      .domain([
        0,
        d3.max(data, function(d) { return d['y'] })
      ])
      .range([
        configuration.chart.height,
        0
      ])
   
    return true;
  },

  render = function(container) {
    elements.svg = d3.select(elements.container)
      .append('svg')
      .attr('height', configuration.svg.height)
      .attr('width', configuration.svg.width)
   elements.chart = elements.svg.append('g')
      .classed('chart', true)
      .attr('transform', 'translate(' + configuration.svg.margin + 
         ', -' + configuration.svg.margin + ")")
    
    elements.xAxis = applyXAxis();
    elements.yAxis = applyYAxis();
    elements.bars = drawBars(data);
  },

  refresh = function(newData) {
    data = newData;
    duration = configuration.duration || 500;

    bars.data(data)
      .transition()
      .duration(duration)
      .attr('y', function(d, i) {
        return scales.yScale(d['y']);
      })
      .attr('height', function(d) {
        return (configuration.chart.height - scales.yScale(d['y']))   
      }) 
  },

  resize = function(newWidth) {
    container = $(elements.container).children('svg');
    dimensions = {
      height: container.height(),
      width: container.width()
    }
    aspectRatio = dimensions.width / dimensions.height;

    elements.chart.attr('width', newWidth)
      .attr('height', newWidth * aspectRatio);
  }

  // Little method for debugging strange problems with the way that the
  // domain is being rendered so that tweaks can be made. Not a long term
  // part of the API
  inspect = function() {
    return { 
      svg: configuration.svg,
      chart: configuration.chart,
      elements: elements,
      scales: scales
    }
  }

  // Private functions
  drawBars = function() {
    graph_values = elements.chart.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')

    graph_values.attr('width', configuration.bar.width)
      .attr('height', function(d) {
        return configuration.svg.height - scales.yScale(d['y'])
      }) 
      .attr('x', function(d, i) { return scales.xScale(d['x']); })
      .attr('y', function(d, i) { return scales.yScale(d['y']); })
      .attr('fill', 'teal')
      .classed('graph', true)
  
      return graph_values 
  },

  applyXAxis = function() { 
    ticks = configuration.ticks || 5;
 
    var xAxis = d3.svg.axis()
      .scale(scales.xScale)
      .orient('bottom');

    elements.svg.append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', 'translate(' + 
        (configuration.svg.margin + configuration.bar.width) +
        ', ' + (configuration.svg.height - configuration.svg.margin) + 
        ')')
      .call(xAxis);
    return xAxis;
  },
  
  applyYAxis = function() {
    ticks = configuration.ticks || 5;

    var yAxis = d3.svg.axis()
      .scale(scales.yScale)
      .orient('left')
      .ticks(ticks);
    elements.svg.append('g')
      .attr('class', 'axis yAxis')
      .attr('transform', 'translate(' + configuration.svg.margin + ', 0)')
      .call(yAxis)
    return yAxis;
  };

  return {
    init: init,
    render: render,
    refresh: refresh,
    resize: resize,
    // For Debugging Purposes only
    inspect: inspect
  };  
};