var fs = require('fs');
var path = require('path');
var assert = require('assert');
var _ = require('lodash');
var Q = require('q');
var rimraf = require('rimraf');
var html = require("./html");
var rmdir = Q.denodeify(rimraf);
var readFile = Q.denodeify(fs.readFile);

require("./build/build_test");

describe("documentjs/lib/generators/html", function(){
	beforeEach(function(){
		return rmdir(path.join(__dirname, "site", "static")).then(function(e){
			return rmdir(path.join(__dirname, "site", "templates"));
		});
	});

	it("can push out dev mode static", function(){
		this.timeout(240000);
		return rmdir(path.join(__dirname, "test", "tmp")).then(function(){
			var options = {
				dest: path.join(__dirname, "test", "tmp"),
				devBuild: true,
				minify: false,
				parent: "index",
				forceBuild: true
			};

			var docMap = Q.Promise(function(resolve){
				resolve(_.assign({
					index: {
						name: "index",
						type: "page",
						body: "Hello <strong>World</strong>"
					}
				}));
			});

			return html.generate(docMap,options).then(function(){
				if(!fs.existsSync(path.join(__dirname, "test", "tmp", "static", "styles", "styles.less"))) {
					throw new Error("canjs does not exist");
				}
				if(fs.existsSync(path.join(__dirname, "test", "tmp", "static", "bundles", "static.js"))) {
					throw new Error("static build exists");
				}
			});
		});
	});

	it("body is rendered as a mustache template prior to markdown with templateRender", function(){
		this.timeout(240000);
		return rmdir(path.join(__dirname, "test", "tmp")).then(function(){
			var options = {
				dest: path.join(__dirname, "test", "tmp"),
				parent: "index",
				templateRender: true
			};

			var docMap = Q.Promise(function(resolve){
				resolve(_.assign({
					index: {
						name: "index",
						type: "page",
						body: "Hello `{{thing.params.0.name}}`"
					},
					thing: {
						name: "thing",
						params: [
							{
								name: "first"
							}
						]
					}
				}));
			});

			return html.generate(docMap,options);
		}).then(function(){
			return readFile(path.join(__dirname, "test", "tmp", "index.html"));
		}).then(function(data){
			assert.ok(/<code>first<\/code>/.test(""+data), "got first");
		});
	});

	it("closing script tags are properly escaped", function() {
		this.timeout(40000);

		return rmdir(path.join(__dirname, "test", "tmp")).then(function() {
			var options = {
				dest: path.join(__dirname, "test", "tmp"),
				parent: "index",
				templateRender: true
			};

			var docMap = Q.Promise(function(resolve){
				resolve(_.assign({
					index: {
						name: "index",
						type: "page",
						body: [
							"Hello `{{thing.params.0.script}}`",
							"Load steal using \n\n `{{thing.params.1.script}}`"
						].join("\n")
					},
					thing: {
						name: "thing",
						params: [
							{script: "<script>function() {return true; }</script>"},
							{script: "<script src=\"./dist/steal/steal.js\"></script>"}
						]
					}
				}));
			});

			return html.generate(docMap, options);
		})
		.then(function() {
			return readFile(path.join(__dirname, "test", "tmp", "index.html"));
		})
		.then(function(data) {
			var index = data.toString();
			assert.ok(
				index.includes("<code>&amp;lt;script&amp;gt;function() {return true; }&amp;lt;\/script&amp;gt;<\/code>"),
				"script closing tag escaped"
			);
		})
		.then(function() {
			return readFile(path.join(__dirname, "test", "tmp", "thing.html"));
		})
		.then(function(data) {
			var content = data.toString();
			var rx = /<\/script>/g;
			var docObject = content.substring(
				content.indexOf("var docObject = "),
				content.indexOf("};", content.indexOf("var docObject = "))
			);

			assert.ok(
				!rx.test(docObject),
				"docObject should not have unscaped closing script tags"
			);
		});
	});

	it("slashes get put in a folder and can link correctly", function(){
		this.timeout(240000);
		return rmdir(path.join(__dirname, "test", "tmp")).then(function(){
			var options = {
				dest: path.join(__dirname, "test", "tmp"),
				parent: "index"
			};

			var docMap = Q.Promise(function(resolve){
				resolve(_.assign({
					index: {
						name: "index",
						type: "page",
						body: "To [module/name]"
					},
					"module/name": {
						name: "module/name",
						body: "To [index]"
					}
				}));
			});

			return html.generate(docMap,options);
		}).then(function(){
			return readFile(path.join(__dirname, "test", "tmp", "module", "name.html"));
		}).then(function(data){
			assert.ok((""+data).indexOf('src="../static/steal.production.js"') !== -1, "got the right path to scripts");
			assert.ok((""+data).indexOf('href="../static/bundles/bit-docs-site/static.css"') !== -1, "got the right path to styles");
			assert.ok((""+data).indexOf('<a href="../index.html" title="index">index</a>') !== -1, "got the right thing to index");
		});
	});

	it("dest on docObject works", function(){
		this.timeout(240000);
		return rmdir(path.join(__dirname, "test", "tmp")).then(function(){
			var options = {
				dest: path.join(__dirname, "test", "tmp", "deep"),
				parent: "index"
			};

			var docMap = Q.Promise(function(resolve){
				resolve(_.assign({
					index: {
						name: "index",
						type: "page",
						body: "To [module/name]",
						dest: "../index"
					},
					"module/name": {
						name: "module/name",
						body: "To [index]"
					}
				}));
			});

			return html.generate(docMap,options);
		}).then(function(){
			return readFile(path.join(__dirname, "test", "tmp", "deep", "module", "name.html"));
		}).then(function(data){
			assert.ok( (""+data).indexOf('<a href="../../index.html" title="index">index</a>') !== -1, "got the right thing to index" );
		});
	});

	it("basic sidebar works", function(){
		this.timeout(240000);
		return rmdir(path.join(__dirname, "test", "tmp")).then(function(){
			var options = {
				dest: path.join(__dirname, "test", "tmp", "sidebar"),
				parent: "earth",
				forceBuild: true
			};

			var docMap = Q.Promise(function(resolve){
				resolve(_.assign({
					earth: {
						name: "earth",
						type: "page",
						body: "Welcome to earth"
					},
					Americas: {
						parent: "earth",
						name: "Americas",
						body: "Americas"
					},
					USA: {
						parent: "Americas",
						name: "USA",
						body: "USA"
					},
					Mexico: {
						parent: "Americas",
						name: "Mexico",
						body: "Mexico"
					},
					Asia: {
						parent: "earth",
						name: "Asia",
						body: "Asia"
					},
					China: {
						parent: "Asia",
						name: "China",
						body: "China"
					},
					India: {
						parent: "Asia",
						name: "India",
						body: "India"
					}
				}));
			});

			return html.generate(docMap,options);
		}).then(function(){
			return readFile(path.join(__dirname, "test", "tmp", "sidebar", "India.html"));
		}).then(function(data){
			assert.ok( (""+data).indexOf('href="Asia.html"') !== -1, "link to asia" );
			assert.ok( (""+data).indexOf('href="China.html"') !== -1, "link to china" );
		});
	});
});
