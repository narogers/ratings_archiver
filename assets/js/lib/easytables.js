var RATINGS = RATINGS || {}

RATINGS.EasyTables = function() 
{
  var data;
  var elements;

  function init(settings) {
    data.labels = settings.labels || [];
    data.values = settings.data || [];
    elements.container = settings.element || 'body';
  };

  function render() {
    output = createTableWrapper();
    output.child('thead').append(createTableHeader(data.labels));
    output.child('tbody').append(createTableRows(data.values));

    elements.container.append(output);
  };

  function createTableWrapper() {
    elements.table = $('<table>').append('thead')
       .append('tbody');

    return elements.table;
  };

  function createTableHeader(labels) {
    wrapper = $('tr');
    labels.each(function(l) {
      wrapper.append('th').text(l);
    });

    return wrapper;
  }

  function createTableRows(values) {
    wrapper = $('tr');
    values.each(function(v) {
      wrapper.append('td').text();  
    });
  }

  return {
    init: init,
    render: render,
  }    
};
