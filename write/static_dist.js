var fss = require('../fs_extras.js');
var Q = require('q');
var path = require("path");
var buildHash = require("../build/build_hash");
var fs = require('fs-extra');
var mkdirs = Q.denodeify(fs.mkdirs);

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/write/static_dist
 *
 * Copies the [bit-docs-generate-html/build/static_dist built distributable]
 * to a _static_ folder in `options.dest`.
 *
 * @signature `staticDist(options)`
 *
 * @param {Object} options Configuration options.
 *
 *   @option {String} dest The static distributable will be written to
 *   `{options.dest}/static`.
 *
 * @return {Promise} A promise that resolves when successfully copied over.
 */
module.exports = function(options){
	var dest = path.join(options.dest,"static");
	var distFolder =  path.join('site','static','dist', buildHash(options));

	return mkdirs(dest).then(function(){
		if(options.debug) {
			console.log("BUILD: Copying production files to "+path.relative(process.cwd(),dest));
		}

		return fss.copyTo(distFolder,dest);
	});
};
