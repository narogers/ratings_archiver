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
    graphs = visualizeScores();
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
  defaults = { height: 300, 
    width: 500 };
  graphs['rating'] = new Rickshaw.Graph( {
    element: document.getElementById('scoreDistributionChart'),
    renderer: 'bar',
    series: [{
      color: 'rgb(102, 216, 222)',
      data: generateAxesByLength(ratingsByScore.computed)
    }],
    max: getGraphCeiling(ratingsByScore.computed, 100),
    width: 600 
  });  
  yAxis = new Rickshaw.Graph.Axis.Y({
    graph: graphs.rating,
  });
  xAxis = new Rickshaw.Graph.Axis.X({
    graph: graphs.rating,
    orientation: 'bottom',
    element: document.getElementById('scoreDistributionXAxis')
  });
  hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graphs.rating,
    xFormatter: function(x) { return x }, 
    yFormatter: function(y) { return y + ' ratings'}
  });
  graphs['rating'].render();  
  yAxis.render();
  xAxis.render();

  return graphs;
}

// Given a score hash creates the x and y axes values for use in
// the graphs
function generateAxesByLength(hash) {
  axes = [];
  Object.keys(hash).sort(sortByNumericValue).forEach(function(k) {
    axes.push({x: parseFloat(k), y: hash[k].length });
  });

  return axes;
}

/**
 * Calculate the ceiling for each graph rounded to the nearest 50
 * Intended to be used when rendering a Rickshaw graph to allow a bit of
 * padding at the upper end of the y axis.
 */
function getGraphCeiling(hash, increment) {
  var max_value = 0;
  rounding_increment = increment || 50;
 
  Object.keys(hash).forEach(function(k) {
    max_value = (max_value < hash[k].length) ? hash[k].length : max_value;  
  });
  ceiling = Math.ceil(max_value / rounding_increment) * rounding_increment;

  return ceiling;
}

function sortByNumericValue(a, b) {
  return parseFloat(a) - parseFloat(b);
}

/**
 * Template to use when loading up the scores, ratings, or other tabular data
 */
function scoreDetailTemplate() {
   template = document.createDocumentFragment();
   
   return template;
}

