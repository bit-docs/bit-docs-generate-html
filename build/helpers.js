var getDefaultHelpers = require("./make_default_helpers");
var _ = require("lodash");
var fsx = require('../fs_extras');
var path = require('path');
var md5 = require("md5");
var Handlebars = require("handlebars");
var buildHash = require("./build_hash");

/**
 * @parent bit-docs-generate-html/modules
 * @module {Promise} bit-docs-generate-html/build/helpers
 *
 * Gets the default helpers, and helpers in the
 * [bit-docs-generate-html/site/templates/buildHash] folder, and registers them
 * with Handlebars.
 * 
 * @signature `build.helpers(buildTemplatesPromise, docMap, options, getCurrent)`
 *
 * Registers helpers
 *
 * @param {Promise<Handlebars>} buildTemplatesPromise The result of calling
 * [bit-docs-generate-html/build/templates]. Building the helpers must happen
 * after the templates have been copied over. Passing this argument enforces
 * that.
 *
 * @param {bit-docs/types/docMap} docMap The [bit-docs/types/docMap] which
 * contains all [bit-docs/types/docObject]s that will be documented.
 *
 * @param {Object} options
 *
 * @param {function():bit-docs/types/docObject} getCurrent
 *
 * A function that when called, returns the [bit-docs/types/docObject]
 * currently being generated.
 *
 * @return {Promise} A promise that resolves when helpers have been added to
 * Handlebars.
 *
 * @body
 */
module.exports = function(buildTemplatesPromise, docMap, options, getCurrent){

	return buildTemplatesPromise.then(function(OtherHandlebars){
		// get the default helpers
		var helpers = getDefaultHelpers(docMap,options,getCurrent, OtherHandlebars);

		var templatesPath = path.join('site/templates', buildHash(options) );

		return fsx.readdir(templatesPath).then(function(files){

			// all files that end with .js
			files.filter(function(filename){
				return filename.indexOf(".js") >=0;
			}).map(function(filename){
				// require them
				var requirePath = path.relative( __dirname, fsx.join(templatesPath, filename) );

				var makeHelpers = require(requirePath);
				var newHelpers = makeHelpers(docMap, options, getCurrent, helpers, OtherHandlebars);

				_.extend(helpers, newHelpers );

			});

			if (helpers) {
				_.each(helpers, function (helper, name) {
					(OtherHandlebars || Handlebars).registerHelper(name, helper);
				});
			}

		});

	});

};
