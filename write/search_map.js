var fs = require('fs');
var path = require('path');
var filename = require("./filename");
var Q = require('q');
var writeFile = Q.denodeify(fs.writeFile);
var mkdirs = Q.denodeify(require("fs-extra").mkdirs);

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/write/search_map
 *
 * Writes out a simplified [bit-docs/types/docMap] to be used for searching.
 *
 * @signature `searchMap(docMap, siteConfig)`
 *
 * @param {bit-docs/types/docMap} docMap
 * 
 * @param {Object} siteConfig
 * 
 * @return {Promise} Resolves when searchMap has been written.
 */
module.exports = function(docMap, siteConfig) {
	var searchMap = {},
		name;

	for (name in docMap) {
		if (docMap.hasOwnProperty(name)) {
			var docObj = docMap[name];
			var searchObj = {
				name: docObj.name,
				title: docObj.title,
				description: docObj.description,
				url: filename(docObj, siteConfig)
			};
			searchMap[name] = searchObj;
		}
	}

	var dest = path.join(siteConfig.dest, 'searchMap.json');

	return mkdirs(siteConfig.dest).then(function(){
		return writeFile(dest, JSON.stringify(searchMap));
	});

};
