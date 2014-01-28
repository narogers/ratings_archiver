var D3UTILS = D3UTILS || {}

D3UTILS.D3Tutorial = function()
{
  var start, 
      finish, 
      upperBound, 
      step;
  
  var generateRandomData = function() { 
    dataset = []
  
    index = start;
    while (index <= finish) {
      point = {
        x: index,
        y: Math.floor(Math.random() * upperBound)
      }
      dataset.push(point);
      index += step;
    }
     
    return dataset;
  };
    
  // Options that are recognized include
  // 
  // start: Start of range. 
  // finish: End of range.
  // upperBounds: Upper limit for randomized integers.
  // step: Interval to step by when incrementing the index
  var init = function(options) {
    start = options['start'] || 1;
    finish = options['finish'] || 100;
    step = options['step'] || 1;
    upperBound = options['upperBound'] || 100;   
  };

  return {
    init: init,
    generateRandomData: generateRandomData
  };

};
