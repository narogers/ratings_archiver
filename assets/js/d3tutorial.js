// Working through the tutorial at http://alignedleft.com/tutorials/d3/
//
// Once everthing is figured out this can be jettisoned as a learning
// experience
console.log('STARTING D3 TUTORIAL')

var dataset = [2.5, 2.9, 3.5, 4.5, 3.9, 4.2]
d3.select('div.barChart')
    .selectAll('div')
    .data(dataset)
    .enter()
    .append('div')
    .classed('value', true)
    .style("height", function(d) {
      return (d/5)*100 + "px";
    }); 
