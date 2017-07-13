
var build = require("./build/build");
var write = require("./write/write");
var Q = require("q");
var fs = require("fs-extra");
var mkdirs = Q.denodeify(fs.mkdirs);
var Handlebars = require("handlebars");

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/generate
 *
 * Generates an HTML site for a [bit-docs/types/docMap]
 * given configuration siteConfig.
 *
 * @signature `generate(docMapPromise, siteConfig)`
 *
 * @param {Promise<bit-docs/types/docMap>} docMapPromise A promise that
 * contains a `docMap` created by [bit-docs-glob-finder/index].
 * 
 * @param {Object} siteConfig Configuration siteConfig.
 *
 * @return {Promise} A promise that resolves when the site has been built.
 */
module.exports = function(docMapPromise, siteConfig){
	// 1. Copies everything from site/default/static to site/static/build
	// 2. Overwrites site/static/build with content in `siteConfig.static`
	// 3. Runs site/static/build/build.js
	//    A. Builds itself and copies everything to site/static/dist
	var staticPromise = build.staticDist(siteConfig).then(function(){
		// copies statics to documentation location.
		return write.staticDist(siteConfig);
	});

	var buildTemplatesPromise = build.templates(siteConfig).then(function(){
		return Handlebars.create();
	});
	buildTemplatesPromise["catch"](function(){
		console.log("problem building templates");
	});

	var currentDocObject;
	var getCurrent = function(){
		return currentDocObject;
	};
	var setCurrent = function(current){
		currentDocObject = current;
	};
	var helpersReadyPromise = docMapPromise.then(function(docMap){
		return build.helpers(buildTemplatesPromise, docMap, siteConfig, getCurrent);
	});
	var searchMapPromise = docMapPromise.then(function(docMap){
		return write.searchMap(docMap, siteConfig);
	});

	var docsPromise = Q.all([
			docMapPromise,
			build.renderer(buildTemplatesPromise, siteConfig),
			helpersReadyPromise,
			mkdirs(siteConfig.dest),
			searchMapPromise
	]).then(function(results){
		var docMap = results[0],
			renderer = results[1];
		return write.docMap(docMap, renderer, siteConfig, setCurrent);
	});
	return Q.all([staticPromise, docsPromise]);
};
