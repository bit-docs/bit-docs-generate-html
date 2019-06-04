var showdown =  require("showdown");

module.exports = function(showdownOptions){
	var converter = new showdown.Converter(showdownOptions);
	return function(content){
		return converter.makeHtml(content);
	};
};
