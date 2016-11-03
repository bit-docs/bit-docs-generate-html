var fs = require('fs'),
	path = require('path'),
	filename = require("./filename"),
	Q = require('q'),
	writeFile = Q.denodeify(fs.writeFile);

/**
 * @function bitDocs.generators.html.write.searchMap
 * @parent bitDocs.generators.html.write.methods
 *
 * Writes out a simplified [documentjs.process.docMap docMap] to be used for searching.
 *
 * @signature `.write.searchMap(docMap, siteConfig)`
 *
 * @param {documentjs.process.docMap} docMap
 * @param {Object} siteConfig
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

	return writeFile(dest, JSON.stringify(searchMap));
};
