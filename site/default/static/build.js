var stealTools = require("steal-tools");
var fsx = require('../../../../fs_extras');
var Q = require('q');
var path = require("path");

module.exports = function(options, folders){
	var copyDir = function(name){
		return fsx.mkdirs(path.join(folders.dist,name)).then(function(){
			return fsx.exists(path.join(folders.build,name)).then(function(exists){
				if(exists) {
					return fsx.copy(path.join(folders.build,name), path.join(folders.dist,name));
				}
			});
		});
	};

	var staticDistPromises = [];
	if(options.html && options.html.staticDist){
		options.html.staticDist.forEach(function(dist){
			if(!path.isAbsolute(dist)){
				dist = path.join(process.cwd(), dist);
			}
			staticDistPromises.push(fsx.copyFrom(dist, folders.dist));
		});
	}

	if(options.devBuild) {
		// copy all dependencies
		staticDistPromises.push(fsx.copy(path.join(folders.build), path.join(folders.dist)));
		// copy everything and steal.js
		return Q.all(staticDistPromises);
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

			staticDistPromises.push(fsx.copy(path.join(folders.build, "dist"), path.join(folders.dist)));
			
			return Q.all(staticDistPromises);
		});
	}
};
