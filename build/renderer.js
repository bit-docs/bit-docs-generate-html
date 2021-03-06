var buildTemplates = require("./templates");
var getRenderer = require("./get_renderer");
var getPartials = require("./get_partials");
var path = require("path");
var md5 = require("md5");
var Q = require("q");
var buildHash = require("./build_hash");

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/build/renderer
 *
 * Creates a renderer function used to generate the documentation.
 *
 * @signature `build.renderer(buildTemplatesPromise, options)`
 *
 * Registers all `.mustache` files in the
 * [bit-docs-generate-html/site/templates/buildHash] folder as partials and
 * creates a [bit-docs-generate-html/types/renderer] function that renders the
 * `content.mustache` template within the `layout.mustache` template.
 *
 * @param {Promise<Handlebars>} buildTemplatesPromise The result of calling
 * [bit-docs-generate-html/build/templates]. Building the renderer must happen
 * after the templates have been copied over. Passing this argument enforces
 * that.
 *
 * @param {{}} options
 *
 * Options used to configure the behavior of the renderer.
 *
 * @return {Promise<bit-docs-generate-html/types/renderer>} A promise that
 * resolves with the renderer function.
 */
module.exports = function(buildTemplatesPromise, options){
	// 1. Copies site/default/templates to site/templates
	// 2. Copies `options.templates` to site/templates
	return buildTemplatesPromise.then(function(Handlebars){
		// Creates a renderer function and adds partials to mustache
		var templatesPath = path.join('site/templates', buildHash(options) );
		return Q.all([
			getRenderer(templatesPath, Handlebars),
			getPartials(templatesPath, Handlebars)
		]).then(function(results){
			// returns the renderer
			return results[0];
		});
	});
};
