// Working through the tutorial at http://alignedleft.com/tutorials/d3/
//
// Once everthing is figured out this can be jettisoned as a learning
// experience
console.log('STARTING D3 TUTORIAL')

ratings_count = generateRandomDataset(0.5, 20);

var svg_dimensions = {height: 500, width: 800};
var bar_dimensions = [];
bar_dimensions['padding'] = 5; 
bar_dimensions['width'] = Math.floor(svg_dimensions['width'] / dataset.length) 
  - bar_dimensions['padding'];
  
var baseline = 50;

var svg = d3.select('div#charts')
            .append('svg')
            .attr('id', 'ratings_distribution')
            .attr('height', svg_dimensions['height'])
            .attr('width', svg_dimensions['width'])
bars = drawBars(dataset);
labels = applyLabels(dataset);
  
// Generate a random dataset
function generateRandomDataset(step, upper_bound) {
  // Set sensible defaults if the parameters are not passed to the function
  step = step || 0.1;
  upper_bound = upper_bound || 20;
  dataset = []

  current_score = 0.5;
  while (current_score < 5.0) {
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
      return Math.round(d['count']*20);
    }) 
    .attr('x', function(d, i) {
      return i * (bar_dimensions['width'] + bar_dimensions['padding']);
    })
    .attr('y', function(d, i) {
      return svg_dimensions['height']-(d['count']*20)-baseline;
    })
    .attr('fill', function(d) {
      return 'teal';
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

  score_labels = svg.selectAll('text')
    .data(dataset)
    .enter()
    .append('text')
    .filter(function(d, i) {
      console.log("[" + i + "] " + d['score']);
      console.log('Display this value => ' + (i % interval == 0));
      return (i % interval == 0);
    })
    .attr('x', function(d, i) {
      offset = (interval * i * (bar_dimensions['width'] + bar_dimensions['padding']))
        + (bar_dimensions['width'] / 2)
     return offset; 
    })
    .attr('y', function(d) {
      return svg_dimensions['height'] - (Math.floor(baseline / 2))
    })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '1.25em')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .text(function(d) {
      label = Math.round(d['score']*10) / 10 + '';
      return label.substr(0,3);
    });

   return score_labels;
}
