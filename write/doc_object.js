var _ = require("lodash"),
	filename = require("./filename"),
	Q = require('q'),
	fs = require("fs"),
	writeFile = Q.denodeify(fs.writeFile),
	path = require("path");
	mkdirs = Q.denodeify(require("fs-extra").mkdirs);
/**
 * @function documentjs.generators.html.write.docObject
 * @parent documentjs.generators.html.write.methods
 *
 * Writes out a [documentjs.process.docObject docObject].
 *
 * @signature `.write.docObject(docObject, renderer, siteConfig, setCurrentDocObjectForHelpers)`
 *
 * @param {documentjs.process.docObject} docObject The doc object to be written out.
 *
 * @param {documentjs.generators.html.types.renderer} renderer A function that renders
 * the output.
 *
 * @param {Object} siteConfig Configuration siteConfig.
 *
 * @option {String} dest The folder name this file will be written to. The
 * filename is determined from the docObject's name.
 *
 * @param {function(documentjs.process.docObject)} setCurrentDocObjectForHelpers
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
