var D3UTILS = D3UTILS || {}

D3UTILS.D3Graph = function() 
{
  // Other variables that need to be tracked but are calculated when the
  // init() method is called
  var configuration = [];
  var data = [];
  var elements = [];
  var scales = [];
      
  function init(settings) {
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
  }

  function debug() {
    console.log('DEBUG OUTPUT');
    console.log('============');
    console.log('Configuration keys are defined for ' + Object.keys(configuration));
    console.log('Element keys are defined for ' + Object.keys(elements));
    console.log('Scale keys are defined for ' + Object.keys(scales));
    console.log('SVG is defined as ' + elements.svg);
    console.log('Chart is defined as ' + elements.chart);
  };

  function render() {
    elements.svg = d3.select(elements.container)
      .append('svg')
      .attr('height', configuration.svg.height)
      .attr('width', configuration.svg.width)
    elements.chart = elements.svg.append('g')
      .classed('chart', true)
      .attr('transform', 'translate(' + configuration.svg.margin + 
         ', ' + configuration.svg.margin + ")")
 
    debug();
    elements.xAxis = applyXAxis();
    elements.yAxis = applyYAxis();
    elements.bars = drawBars(data);
  }

  function refresh(newData) {
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
  }

  function resize(newWidth) {
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
  function inspect() {
    return { 
      svg: configuration.svg,
      chart: configuration.chart,
      elements: elements,
      scales: scales
    }
  }

  // Private functions
  function drawBars() {
    graph_values = elements.chart.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')

    graph_values.attr('width', configuration.bar.width)
      .attr('height', function(d) {
        return configuration.chart.height - scales.yScale(d['y'])
      }) 
      .attr('x', function(d, i) { return scales.xScale(d['x']); })
      .attr('y', function(d, i) { return scales.yScale(d['y']); })
      .attr('fill', 'rgb(239, 243, 255)')
      .attr('stroke-width', '1px')
      .attr('stroke', 'rgb(8, 81, 156)')
      .classed('graph', true)
  
      return graph_values 
  }

  function applyXAxis() { 
    ticks = configuration.ticks || 5;
 
    var xAxis = d3.svg.axis()
      .scale(scales.xScale)
      .orient('bottom');
    
    console.log('Extending axis for elements ' + elements.svg); 
    elements.svg.append('line')
      .attr('x1', configuration.svg.margin)
      .attr('y1', configuration.svg.height - configuration.svg.margin)
      .attr('x2', configuration.svg.width - configuration.svg.margin)
      .attr('y2', configuration.svg.height - configuration.svg.margin)
      .attr('stroke', '1px')
      .attr('color', 'rgb(255, 0, 255)');
     
    elements.svg.append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', 'translate(' + 
        (configuration.svg.margin + configuration.bar.width / 2) + 
        ', ' + (configuration.svg.height - configuration.svg.margin) + 
        ')')
      .call(xAxis);
    return xAxis;
  }
  
  function applyYAxis() {
    ticks = configuration.ticks || 5;

    var yAxis = d3.svg.axis()
      .scale(scales.yScale)
      .orient('left')
      .ticks(ticks);
    elements.svg.append('g')
      .attr('class', 'axis yAxis')
      .attr('transform', 'translate(' + configuration.svg.margin + ', ' +
         configuration.svg.margin + ')')
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
