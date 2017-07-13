var _ = require("lodash");
var filename = require("./filename");
var Q = require('q');
var fs = require("fs");
var writeFile = Q.denodeify(fs.writeFile);
var path = require("path");
var mkdirs = Q.denodeify(require("fs-extra").mkdirs);

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/write/doc_object
 *
 * Writes out a [bit-docs/types/docObject].
 *
 * @signature `docObject(docObject, renderer, siteConfig, setCurrentDocObjectForHelpers)`
 *
 * @param {bit-docs/types/docObject} docObject The [bit-docs/types/docObject]
 * to be written out.
 *
 * @param {bit-docs-generate-html/types/renderer} renderer A function that
 * renders the output.
 *
 * @param {Object} siteConfig Configuration siteConfig.
 *
 *   @option {String} dest The folder name this file will be written to. The
 *   filename is determined from the [bit-docs/types/docObject]'s name.
 *
 * @param {function(bit-docs/types/docObject)} setCurrentDocObjectForHelpers
 *
 * @return {Promise} A promise that resolves when the file has been written out.
 */
module.exports = function(docObject, renderer, siteConfig, setCurrentDocObjectForHelpers){
	var out = path.join(siteConfig.dest, filename(docObject, siteConfig) );
	var rendered;

	if(siteConfig.debug) {
		console.log('OUT: ' + path.relative(process.cwd(),out) );
	}

	// render the content
	setCurrentDocObjectForHelpers(docObject);

	if(docObject.renderer) {
		rendered = docObject.renderer(docObject, renderer);
	} else {
		rendered = renderer(docObject);
	}
	
	return writeFile(out, rendered).catch(function(){
		return mkdirs(path.dirname(out)).then(function(){
			return writeFile(out, rendered);
		});
	});
};
