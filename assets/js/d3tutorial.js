// Working through the tutorial at http://alignedleft.com/tutorials/d3/
//
// Once everthing is figured out this can be jettisoned as a learning
// experience
console.log('STARTING D3 TUTORIAL')

var svg_dimensions = [];
var bar_dimensions = [];
var baseline;
var bars, labels;
var bar_xposition, bar_yposition;
var interval, maximum_value;

function initializeChart() {
  interval = 0.1;
  maximum_value = 20;
  ratings_count = generateRandomDataset(interval, maximum_value);

  svg_dimensions = {height: 500, width: 800};
  bar_dimensions['padding'] = 5; 
  bar_dimensions['width'] = 
    Math.floor(svg_dimensions['width'] / dataset.length) 
    - bar_dimensions['padding'];
  baseline = 50;

  bar_xposition = d3.scale.linear()
    .domain([
      d3.min(ratings_count, function(d) { return d['score'] }),
      d3.max(ratings_count, function(d) { return d['score'] })
    ])
    .rangeRound([0, svg_dimensions['width'] - bar_dimensions['width']])
    .nice();
  bar_yposition = d3.scale.linear()
    .domain([0, maximum_value])
    .rangeRound([svg_dimensions['height'] - baseline, 0])
    .nice() 
  svg = d3.select('div#charts')
    .append('svg')
    .attr('id', 'ratings_distribution')
    .attr('height', svg_dimensions['height'])
    .attr('width', svg_dimensions['width'])
  bars = drawBars(dataset);
  labels = applyLabels(dataset, 5);
}

function refreshValues() {
  new_values = generateRandomDataset(interval, maximum_value);
  bars.data(new_values)
    .transition()
    .duration(500)
    .attr('y', function(d, i) {
      return bar_yposition(d['count']);
    })
    .attr('height', function(d) {
       return (svg_dimensions['height'] - baseline) - 
         bar_yposition(d['count']);
    })
}

// Generate a random dataset
function generateRandomDataset(step, upper_bound) {
  // Set sensible defaults if the parameters are not passed to the function
  step = step || 0.1;
  upper_bound = upper_bound || 20;
  dataset = []

  current_score = 0.5;
  while (current_score <= 5.0) {
    point = {
      score: current_score,
      count: Math.floor(Math.random() * upper_bound)
    }
    dataset.push(point);
    current_score += step;
  }
 
  return dataset
}

function drawBars(dataset) {
  // If no dataset is provided another option would be to simply exit. On
  // the other hand a better, and more robust touch, would be to make sure it
  // is actually an array
  dataset = dataset || []

  graph_values = svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')

  graph_values.attr('width', bar_dimensions['width'])
    .attr('height', function(d) {
      return (svg_dimensions['height'] - baseline) - bar_yposition(d['count']);
    }) 
    .attr('x', function(d, i) {
      return bar_xposition(d['score']);
    })
    .attr('y', function(d, i) {
      return bar_yposition(d['count']);
    })
    .attr('fill', 'teal')
    .attr('data-total', function(d, i) {
      return d['count'];
    })
    .attr('data-score', function(d, i) {
      return d['score'];
    })
    .classed('graph', true)
  return graph_values 
}

// Set the interval to apply labels to only each nth value rather than
// all of them. This is good in situations where they will not all fit neatly
// into the bar graph
function applyLabels(dataset, interval) {
  dataset = dataset || []
  interval = interval || 1  
  normalize_label = d3.format('0.1f');

  score_labels = svg.selectAll('text')
    .data(dataset)
    .enter()
    .append('text')
    .filter(function(d, i) {
      return (i % interval == 0);
    })
    .attr('x', function(d, i) {
      return bar_xposition(d['score']);      
    })
    .attr('y', function(d) {
      return svg_dimensions['height'] - (Math.floor(baseline / 2))
    })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '0.75em')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return normalize_label(d['score']);
    });

   return score_labels;
}
