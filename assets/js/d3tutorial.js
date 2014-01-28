// Working through the tutorial at http://alignedleft.com/tutorials/d3/
//
// Once everthing is figured out this can be jettisoned as a learning
// experience
console.log('STARTING D3 TUTORIAL')

var dataset = []
while (dataset.length < 20) {
  // Generate a random number between 0.5 and 5.0
  seed = Math.random()*5;
  seed = Math.min(seed, 5);
  seed = Math.max(seed, 0.5);

  dataset.push(seed);
}

var svg_dimensions = {height: 300, width: 500};
var bar_dimensions = {width: 20};
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
      return Math.round(d*60);
    }) 
  .attr('x', function(d, i) {
      return (i*bar_dimensions['width']*1.5);
    })
  .attr('y', function(d, i) {
      console.log("Element value => " + Math.round(d*80));
      console.log("Y offset for element " + i + " => " + 
        (svg_dimensions['height']-Math.round(d*80)))
      return svg_dimensions['height']-(d*60);
    })
  .classed('graph', true)
