var querystring = require('querystring'),
	  request = require('request'),
    TQueue = require('tqueue');

var defaults = {
	addressdetails: 1,
	limit: 3,
	format: 'json'
};

var search_url_suffix = 'search?';
var reverse_url_suffix = 'reverse?';

function Nominatim(base_url) {
	var queue = new TQueue({delay: 1000});
	var base_url = base_url || 'http://nominatim.openstreetmap.org/';

	queue.on('pop', function(item) {
	  request(item.url + querystring.stringify(item.options), function(err, res) {
	    try {
	      var results = JSON.parse(res.body);
	    } catch(error) {
	      var err = new Error(res.body);
	      var results = null;
	    }

	    item.callback(err, item.options, results);
	  });
	});

	function search(options, callback) {
	  var opts = extend(options);

	  queue.push({url: this.base_url + search_url_suffix, options: options, callback: callback});
	};

	function reverse(options, callback) {
	  var opts = extend(options);

	  queue.push({url: this.base_url + reverse_url_suffix, options: opts, callback: callback});
	};

	return {
		base_url: base_url,
		search: search,
		reverse: reverse
	};
};

Nominatim.defaults = function(options) {
	if(!options) {
		return defaults;
	} else {
		defaults = extend(options);
	}
};

var extend = function(options) {
  for (var i in defaults) {
    if (!options[i]) {
      options[i] = defaults[i];
    }
  }

  return options;
};

module.exports = Nominatim;
