var stealTools = require("steal-tools");
var fsx = require('../../../../fs_extras');
var Q = require('q');
var path = require("path");

/**
 * @parent bit-docs-generate-html/site/default/static
 * @module {function} bit-docs-generate-html/site/default/static/build.js
 *
 * @description The `bit-docs-site` script for building static assets.
 *
 * @signature `build(options, folders)`
 *
 * Copies everything and `steal.js`.
 * 
 * @body
 * 
 * Gets copied to
 * [bit-docs-generate-html/site/static/build/buildHash/build.js].
 */
module.exports = function(options, folders){
	var copyDir = function(name){
		return fsx.mkdirs( path.join(folders.dist,name) ).then(function(){
			return fsx.exists(path.join(folders.build,name)).then(function(exists){
				if(exists) {
					return fsx.copy( path.join(folders.build,name), path.join(folders.dist,name) );
				}
			});
		});
	};
	if(options.devBuild) {
		// copy all dependencies
		var promise = Q.all([
			fsx.copy(path.join(folders.build), path.join(folders.dist) )
		]);
		// copy everything and steal.js
		return promise;
	} else {

		// run steal-tools and then copy things
		return stealTools.build({
			config: __dirname+"/package.json!npm",
			main: "bit-docs-site/static"
		},{
			minify: options.minifyBuild === false ? false : true,
			quiet: options.debug ? false : true,
			debug: options.debug ?  true : false,
			bundleAssets: true
		}).then(function(){
			if(options.debug) {
				console.log("BUILD: Copying build to dist.");
			}
			return fsx.copy(path.join(folders.build, "dist"), path.join(folders.dist) );
			// copy everything to DIST
			/*return Q.all([
				fsx.mkdirs( path.join(folders.dist,"bundles") ).then(function(){
					return fsx.copy(path.join(folders.build,"bundles"), path.join(folders.dist,"bundles") );
				}),
				fsx.copyFrom(path.join( require.resolve("steal"), "..", "steal.production.js"), path.join(folders.dist,"steal.production.js") ),
				fsx.copy( path.join(folders.build,"html5shiv.js"), path.join(folders.dist,"html5shiv.js")),

				copyDir("fonts"),

				copyDir("img"),
				copyDir("templates")
			]);*/

		});
	}
};
