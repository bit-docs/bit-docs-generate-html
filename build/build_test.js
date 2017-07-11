require("./make_default_helpers_test");

var getRenderer = require('./get_renderer');
var getPartials = require('./get_partials');
var build = require("./build");
var assert = require('assert');
var Q = require('q');
var path = require('path');
var rmdir = require('rimraf');
var fs = require('fs');
var read = Q.denodeify(fs.readFile);

describe("documentjs/lib/generators/html/build",function(){

	beforeEach(function(done){
		rmdir(path.join(__dirname,"..","site","static"), function(e){
			rmdir(path.join(__dirname,"..","site","templates"), done);
		});
	});

	it("get_renderer and get_partial work",function(done){
		Q.all([
			getRenderer('build/test/templates'),
			getPartials('build/test/templates')
		]).then(function(results){

			var renderer = results[0];

			var result = renderer({subject: "World"});

			assert.equal(result, "<html><h1>Hello World</h1></html>");
			done();
		},done).catch(done);
	});

	it("build.renderer build.templates build.helpers",function(done){

		var options = {
			html: { templates: path.join(__dirname,"test","templates_with_helpers") },
			dest: "XXXXYYYZZZ",
			forceBuild: true,
			pageConfig: {
				project: {
					source: "http://test.com"
				}
			}
		};
		buildTemplatesPromise = build.templates(options);

		var data = {subject: "World", message: "hello"};
		var getCurrent = function(){
			return data;
		};


		Q.all([
			build.renderer(buildTemplatesPromise, options),
			build.helpers(buildTemplatesPromise, {}, options, getCurrent)
		]).then(function(results){

			var renderer = results[0];

			var result = renderer({
				subject: "World",
				src: "./index.js",
				type: "",
				line: "100"
			});

			assert.equal(result, "<html><h1>HELLO World</h1>\n</html>");
			done();
		},done).catch(done);

	});

	it("Does ignoreTemplateRender",function(done){
		var options = {
			html: {templates: path.join(__dirname,"test","render_body_option")},
			dest: "XXXXYYYZZZ",
			forceBuild: true,
			pageConfig: {
				project: {
					source: "http://test.com"
				}
			}
		};
		buildTemplatesPromise = build.templates(options);

		var data = {message: "this isnt doing anything"};
		var getCurrent = function(){
			return data;
		};

		Q.all([
			build.renderer(buildTemplatesPromise, options),
			build.helpers(buildTemplatesPromise, {}, options, getCurrent)
		]).then(function(results){

			var renderer = results[0];

			var result = renderer({body: "{{message}} stuff"});

			assert.equal(result, "<html><h1>{{message}} stuff</h1>\n<p>static</p></html>");
			done();
		},done).catch(done);

	});

	it("builds the static dist", function(){
		this.timeout(120000);
		return build.staticDist({
			forceBuild: true,
			html: {
				dependencies: {
					"can-component": "3.0.0-pre.9"
				}
			}
		}).then(function(result){
			return read(path.join(__dirname, "..", result.distFolder, "bundles","bit-docs-site","static.js"));
		}).then(function(res){
			assert.ok(/can-component/.test(res), "got static.js with component");
		});
	});

	it("copy absolute staticDist folders to static dist", function(){
		this.timeout(120000);
		return build.staticDist({
			forceBuild: true,
			html: {
				staticDist: [
					path.join(__dirname, '..', 'test-static-dist')
				]
			},
		}).then(function(result){
			return read(path.join(__dirname, "..", result.distFolder, "test.css"));
		}).then(function(res){
			assert.ok(/#TestID/.test(res), "got test.css file");
		});
	});

	it("copy relative staticDist folders to static dist", function(){
		this.timeout(120000);
		return build.staticDist({
			forceBuild: true,
			html: {
				staticDist: [
					'./test-static-dist'
				]
			},
		}).then(function(result){
			return read(path.join(__dirname, "..", result.distFolder, "test.css"));
		}).then(function(res){
			assert.ok(/#TestID/.test(res), "got test.css file");
		});
	});

	it("makes linked content",function(done){
		var options = {
			html: { templates: path.join(__dirname,"test","escaped") },
			dest: "XXXXYYYZZZ",
			forceBuild: true,
			pageConfig: {
				project: {
					source: "http://test.com"
				}
			}
		};
		buildTemplatesPromise = build.templates(options);

		var docObject = {
			src: "./index.js",
			type: "",
			line: "100",
			description: "This is [something]"
		};
		var getCurrent = function(){
			return docObject;
		};
		var docMap = {
			"index": docObject,
			something: {name: "something", title: "<something/>"}
		};


		Q.all([
			build.renderer(buildTemplatesPromise, options),
			build.helpers(buildTemplatesPromise, docMap, options, getCurrent)
		]).then(function(results){

			var renderer = results[0];

			var result = renderer(docObject);
			assert.equal(result, "<html><p>This is <a href=\"something.html\" title=\"something\"><something/></a></p>\n\n</html>");
			done();
		},done).catch(done);
	});

});
