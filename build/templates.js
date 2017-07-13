var fsx = require('../fs_extras');
var	Q = require('q');
var md5 = require('md5');
var path = require('path');
var promiseLock = require("../promise_lock");
var queue = promiseLock();
var buildHash = require("./build_hash");
var _ = require("lodash");

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/build/templates
 *
 * Creates a folder with all the templates used to generate the documentation.
 *
 * @signature `build.templates(siteConfig)`
 *
 * Builds the [bit-docs-generate-html/site/templates/buildHash] folder with the
 * following steps:
 *
 * 1. Copies [bit-docs-generate-html/site/default/templates] to
 * [bit-docs-generate-html/site/templates/buildHash].
 * 2. Copies `siteConfig.templates` to
 * [bit-docs-generate-html/site/templates/buildHash].
 *
 * @param {{}} siteConfig
 *
 * siteConfig used to configure the behavior of the templates.
 *
 *   @option {Boolean} [forceBuild=false] If set to `true`, rebuilds the static
 *   bundle even if it has already been built.
 *   
 *   @option {String} [templates] The location of templates used to overwrite or
 *   add to the default templates.
 *
 * @return {Promise} A promise that resolves if the static dist was
 * successfully created.
 */
module.exports = function(siteConfig){

	return queue(function(){

		var hash = buildHash(siteConfig);
		var target = path.join("site","templates",hash);
		var makeTemplates = function(){
			return fsx.mkdirs(target).then(function(){
				return fsx.copy( path.join("site","default","templates"),target).then(function(){
					var templatesConfig = _.get(siteConfig, "html.templates");
					if( templatesConfig ){
						if(!Array.isArray(templatesConfig)) {
							templatesConfig = [templatesConfig];
						}
						if(siteConfig.debug) {
							console.log("BUILD: Copying templates from "+templatesConfig.join(", "));
						}
						var result = Q();
						templatesConfig.forEach(function(templatesPath){
							result = result.then(function(){
								return fsx.copyFrom(templatesPath,target)
							});
						});

						return result;
					}
				});
			});
		};

		// if forceBuild, copy all templates over again
		if(siteConfig.forceBuild) {
			return makeTemplates();
		} else {
			return fsx.exists(target).then(function(exists){
				if(exists) {
					if(siteConfig.debug) {
						console.log("BUILD: Using cache",target);
					}
				} else {
					return makeTemplates();
				}
			});
		}
	});

};
