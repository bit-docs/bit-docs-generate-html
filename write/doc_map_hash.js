var fs = require('fs'),
	path = require('path'),
	Q = require('q'),
	writeFile = Q.denodeify(fs.writeFile),
	mkdirs = Q.denodeify(require("fs-extra").mkdirs),
	md5 = require('md5');

/**
 * @function bitDocs.generators.html.write.docMapHash
 * @parent bitDocs.generators.html.write.methods
 *
 * Writes out file containing an md5 hash of a docMap-like object
 *  (docMap or subset of a docMap)
 *
 * @signature `.write.docMapHash(docMap, siteConfig)`
 *
 * @param {documentjs.process.docMap} docMap
 * @param {Object} siteConfig
 * @return {Promise} Resolves when docMapHash has been written.
 */
module.exports = function(docMap, siteConfig) {
	var docMapHashConfig = {
				hash: md5(JSON.stringify(docMap))
			},
			dest = path.join(siteConfig.dest, 'docMapHash.json');
			
	return mkdirs(siteConfig.dest).then(function(){
		return writeFile(dest, JSON.stringify(docMapHashConfig)).then(function(){
			return docMapHashConfig;
		});
	});

};
