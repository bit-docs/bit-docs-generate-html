var stealTools = require("steal-tools"),
	fsx = require('../../../../fs_extras'),
	Q = require('q'),
	path = require("path");


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

	var staticDistPromises = [];
	options.html.staticDist.forEach(function(dist){
		staticDistPromises.push(fsx.copy(dist, path.join(folders.dist)));
	});

	if(options.devBuild) {
		// copy all dependencies
		var promise = Q.all([
			fsx.copy(path.join(folders.build), path.join(folders.dist) )
		].concat(staticDistPromises));
		// copy everything and steal.js
		return promise;
	} else {

		Promise.all(staticDistPromises).then(function(){
			// run steal-tools and then copy things
			return stealTools.build({
				config: __dirname+"/package.json!npm",
				main: "bit-docs-site/static"
			},{
				minify: options.minifyBuild === false ? false : true,
				quiet: options.debug ? false : true,
				debug: options.debug ?  true : false,
				bundleAssets: true
			});
		}).then(function(){
			if(options.debug) {
				console.log("BUILD: Copying build to dist.");
			}
			return fsx.copy(path.join(folders.build, "dist"), path.join(folders.dist) );
		});
	}
};
