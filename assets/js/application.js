var ratings;
var ratingsByStyle;
var ratingsByScore;
var scores;
var graphs;

function initializeRatings(endpoint) {
  ratings = [];
  ratingsByStyle = [];
  ratingsByScore = [];
  scores = [];
  graphs = [];

  d3.json(endpoint, function(error, json) {
    if (error) return console.warn(error);

    ratings = json;
    ratingsByStyle = analyzeStyles();
    ratingsByScore = analyzeScores();
    visualizeScores();
  });
}

function visualizeScores() {
  updateOverview();
  renderCharts();
}

function updateOverview() {
  scores = ratings.map(function(r) { return r.computed_score });
  numberFormatter = d3.format('0.3r');

  $('dd.total-ratings').text(ratings.length + ' Ratings');
  $('dd.average-score').text(
    numberFormatter(d3.mean(scores))
  );
  $('dd.median-score').text(
    numberFormatter(d3.median(scores))
  ) 
  $('dd.unique-styles').text(
    ratingsByStyle.keys().length
  )
}
   
function analyzeStyles() {
  ratingsByStyle = d3.nest()
    .key(function(r) { return r.style })
    .map(ratings, d3.map);
 
  return ratingsByStyle;
}

function analyzeScores() {
  ratingsByScore = {
    flavor: [],
    palate: [],
    aroma: [],
    appearance: [],
    overall: [],
    computed: []
  };

  // Initialize the flavor and aroma arrays
  for (i = 1; i <= 5; i++) {
    ratingsByScore['palate'][i] = [];
    ratingsByScore['aroma'][i] = [];
  };
  for (i = 1; i <= 10; i++) {
    ratingsByScore['flavor'][i] = [];
    ratingsByScore['appearance'][i] = [];
  };
  for (i = 1; i <= 20; i++) {
    ratingsByScore['overall'][i] = [];
  };
  keyFormatter = d3.format('0.1f');
  for (i = 0.5; i <= 5.0; i += 0.1) {
    ratingsByScore.computed[keyFormatter(i)] = [];
  }

  ratings.forEach(function(r) {
    ratingsByScore['flavor'][r.flavor].push(r.ratebeer_id);
    ratingsByScore['palate'][r.palate].push(r.ratebeer_id);
    ratingsByScore['aroma'][r.aroma].push(r.ratebeer_id);
    ratingsByScore['appearance'][r.appearance].push(r.ratebeer_id);
    ratingsByScore['overall'][r.overall].push(r.ratebeer_id);
    ratingsByScore.computed[keyFormatter(r.computed_score)].push(r.ratebeer_id);
  });
 
  return ratingsByScore;
}

function renderGeographicData() {
}
 
function renderCharts() {
  default_height = 300;
  default_width = 500;

  graphs.computed = new D3UTILS.D3Graph();
  graphs.computed.init({
    data: generateAxesByLength(ratingsByScore.computed),
    element: '#scoreDistribution',
    height: default_height,
    width: default_width,
    margin: 35 
  });
  flavor_graph = new D3UTILS.D3Graph();
  flavor_graph.init({
    data: generateAxesByLength(ratingsByScore['flavor']),
    element: '#flavorDistribution',
    height: default_height,
    width: default_width,
    margin: 35 
  });
  palate_graph = new D3UTILS.D3Graph();
  palate_graph.init({
    data: generateAxesByLength(ratingsByScore['palate']),
    element: '#palateDistribution',
    height: default_height,
    width: default_width,
    margin: 35 
  });
  
  graphs.computed.render();
  //flavor_graph.render();
  //palate_graph.render();
}

// Given a score hash creates the x and y axes values for use in
// the graphs
function generateAxesByLength(hash) {
  axes = [];
  Object.keys(hash).sort(sortByNumericValue).forEach(function(k) {
    axes.push({x: k, y: hash[k].length });
  });

  return axes;
}

function sortByNumericValue(a, b) {
  return parseFloat(a) - parseFloat(b);
}
