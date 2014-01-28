// Working through the tutorial at http://alignedleft.com/tutorials/d3/
//
// Once everthing is figured out this can be jettisoned as a learning
// experience
console.log('STARTING D3 TUTORIAL')

var dataset = [];
var current_score = 0.5;
while (current_score < 5.0) {
  total = Math.floor(Math.random()*10);
  point = {
    score: current_score,
    count: total
  };
  dataset.push(point);        
  current_score += 0.1;
}
 
var svg_dimensions = {height: 500, width: 1000};
var bar_dimensions = [];
bar_dimensions['padding'] = 5; 
bar_dimensions['width'] = 
  Math.floor(svg_dimensions['width'] / dataset.length - bar_dimensions['padding'])

var baseline = 50;

var svg = d3.select('div#charts')
            .append('svg')
            .attr('id', 'ratings_distribution')
            .attr('height', svg_dimensions['height'])
            .attr('width', svg_dimensions['width'])
  
var graph_values = svg.selectAll('rect')
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
      return "rgb(0, 0, " + (255 - (d['count']*25)) + ")";
    })
  .classed('graph', true)

var labels = svg.selectAll('text')
  .data(dataset)
  .enter()
  .append('text')
  .attr('x', function(d, i) {
      return i * (bar_dimensions['width'] + bar_dimensions['padding']);
    })
  .attr('y', function(d) {
      return svg_dimensions['height'] - (Math.floor(baseline / 2))
    })
  .text(function(d) {
      label = d['score'] + '';
      return label.substr(0,3);
    })
