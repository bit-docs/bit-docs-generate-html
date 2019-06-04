var _ = require("lodash");
var path = require("path");
var stmd_to_html = require("../stmd_to_html");
var deepExtendWithoutBody = require("./deep_extend_without_body");
var escape = require('escape-html');
var striptags = require('striptags');
var DocMapInfo = require("../doc-map-info");
var unescapeHTML = require("unescape-html");
var makeShowdown = require("../showdown_to_html");

function escapeOnlySingleElements(text) {
	//This could be an alternate way of detecting if markdown escaped
	//var html = stmd_to_html("<p>"+text+"</p>\n");
	//if(html === "<p>"+text+"</p>\n") { }
	if(/^<\w+\/?>$/.test(text)) {
		return escape(text);
	} else {
		return text;
	}
}

// Helper helpers

var sortChildren = function(child1, child2) {
	if(typeof child1.order == "number"){
		if(typeof child2.order == "number"){
			// same order given?
			if(child1.order == child2.order){
				// sort by name
				if(child1.name < child2.name){
					return -1;
				}
				return 1;
			} else {
				return child1.order - child2.order;
			}
		} else {
			return -1;
		}
	} else {
		if(typeof child2.order == "number"){
			return 1;
		} else {
			// alphabetical
			if(child1.name < child2.name){
				return -1;
			}
			return 1;
		}
	}
};

var docsFilename = require("../write/filename");

var linksRegExp = /[\[](.*?)\]/g;
var linkRegExp = /^(\S+)\s*(.*)/;
var httpRegExp = /^http/;

/**
 * @parent bit-docs-generate-html/templates
 * @module {function} bit-docs-generate-html/build/make_default_helpers
 */
module.exports = function(docMap, config, getCurrent, Handlebars){
	var docMapInfo = new DocMapInfo(docMap, getCurrent);

	var showdown_to_html;
	if(config.showdown) {
		showdown_to_html = makeShowdown(config.showdown);
	}


	var urlTo = function(name){
		var currentDir = path.dirname( path.join(config.dest, docsFilename( getCurrent(), config)) );
		var toPath = path.join(config.dest,docsFilename( docMap[name] || name, config));
		var out = path.relative(currentDir,toPath);
		return out;
	};

	var pathToRoot = function(name){
		var toPath = path.join(config.dest, docsFilename(docMap[name] || name, config));
		var root = config.cwd || config.dest;
		var out = path.relative(path.dirname(toPath), root);
		return out;
	};

	var stripMarkdown = function(content) {
		var html = helpers.makeHtml(content).replace(linksRegExp, function(str) {
			var noBrackets = str.replace(/[\[]|[\]]/g, '');
			var parts = noBrackets.match(linkRegExp);
			if (parts && parts[2]) {
				return parts[2];
			}
			if(parts) {
				return parts[1].split('\/').pop();
			} else {
				return str;
			}
		});
		return striptags(html).trim();
	};

	var helpers = {
		// DOC MAP HELPERS
		getCurrentTree: function(){
            return docMapInfo.getCurrentTree();
        },
		isGroup: function(docObject){
            return docMapInfo.isGroup(docObject);
        },
		isCurrent: function(docObject, options){
            return docMapInfo.isCurrent(docObject);
        },
        hasCurrent: function(docObject) {
            return docMapInfo.hasCurrent(docObject);
        },
        hasOrIsCurrent: function(docObject){
            return docMapInfo.hasOrIsCurrent(docObject);
        },
        getTitle: function(docObject){
            return docMapInfo.getTitle(this);
        },
        getLinkTitle: function(docObject) {
            var description = docObject.description || docObject.name;
            description = helpers.stripMarkdown(description);
            return unescapeHTML(description);
        },
        getShortTitle: function(docObject){
            return docMapInfo.getShortTitle(docObject);
        },
		sortChildren: function(children) {
            var ordered = [],
                sorted = [];

            children.forEach(function(el) {
                var doc = el.docObject;
                if (doc && typeof doc.order === 'number') {
                    ordered.push(el);
                } else {
                    sorted.push(el);
                }
            });

            // Sort alphabetically, "/" comes before "-"
            sorted.sort(function(x,y) {
                var a = x.docObject.name.replace(/\//g, '!'),
                    b = y.docObject.name.replace(/\//g, '!');

                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });

            // Sort by docObject "ordered" property
            ordered.sort(function(x,y) {
                return x.docObject.order - y.docObject.order;
            });

            // Insert ordered items to their index in the alphabetical array
            ordered.forEach(function(el) {
                sorted.splice(el.docObject.order, 0, el);
            });

            return sorted;
        },

		// GENERIC HELPERS

		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.ifEqual ifEqual
		 */
		ifEqual: function( first, second, options ) {
			if(first == second){
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.ifAny ifAny
		 */
		ifAny: function(){
			var last = arguments.length -1,
				options = arguments[last];
			for(var i = 0 ; i < last; i++) {
				if(arguments[i]) {
					return options.fn(this);
				}
			}
			return options.inverse(this);
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.ifNotEqual ifNotEqual
		 */
		ifNotEqual: function( first, second, options ) {
			if(first !== second){
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
		config: function(){
			var configCopy = {};
			for(var prop in config){
				if(typeof config[prop] !== "function"){
					configCopy[prop] = config[prop];
				}
			}
			return JSON.stringify(configCopy);
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.generatedWarning generatedWarning
		 * @signature `{{{generatedWarning}}}`
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * ```
		 * {{{generatedWarning}}}
		 * ```
		 *
		 * MUST use triple-braces to escape HTML so it is hidden in a comment.
		 *
		 * Creates a warning that looks like this:
		 *
		 * ```html
		 * <!--####################################################################
		 * THIS IS A GENERATED FILE — ANY CHANGES MADE WILL BE OVERWRITTEN
		 *
		 * INSTEAD CHANGE:
		 * source: docs/modules/bit-docs-tag-demo/bit-docs.js
		 * @@module bit-docs-tag-demo
		 * ######################################################################## -->
		 * ```
		 */
		generatedWarning: function(){
			var current = getCurrent();
			return "<!--####################################################################\n" +
						 "\tTHIS IS A GENERATED FILE — ANY CHANGES MADE WILL BE OVERWRITTEN\n\n" +
						 '\tINSTEAD CHANGE:\n' +
						 "\tsource: " + (current && current.src && current.src.path ? current.src.path : 'unknown') +
						 (current.type ? '\n\t@' + current.type + " " + current.name : '') +
						 "\n######################################################################## -->";
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.makeTitle makeTitle
		 *
		 * Given the [bit-docs/types/docObject] context, returns a "pretty"
		 * name that is used in the sidebar and the page header.
		 */
		makeTitle: function () {
			var node = this, title;

			if (node.title) {
				return node.title;
			}
			// name: "cookbook/recipe/list.static.defaults"
			// parent: "cookbook/recipe/list.static"
			// src: "cookbook/recipe/list/list.js"
			var parentParent = docMap[node.parent] && docMap[node.parent].parent;
			// check if we can replace with our parent

			if( node.name.indexOf(node.parent + ".") === 0){
				title = node.name.replace(node.parent + ".", "");
			} else if(parentParent && parentParent.indexOf(".") > 0 && node.name.indexOf(parentParent + ".") === 0){
				// try with our parents parent
				title = node.name.replace(parentParent + ".", "");
			} else {
				title = node.name;
			}

			return title;
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.makeLinks makeLinks
		 *
		 * Looks for links like [].
		 */
		makeLinks: function(text){
			if (!text) return "";
			var replacer = function (match, content) {
				var parts = content.match(linkRegExp),
					name,
					hashParts,
					description,
					linkText,
					docObject,
					href;

				name = parts ? parts[1].replace('::', '.prototype.') : content;

				//the name can be something like 'some-name#someId'
				//this allows linking to a specific section with the hash syntax (#27)
				hashParts = name.split("#");
				name = hashParts.shift();

				docObject = docMap[name]
				if (docObject) {
					linkText = parts && parts[2] ? parts[2] : docObject.title || name;
					description = docObject.description || name;

					//if there is anything in the hashParts, append it to the end of the url
					href = urlTo(name) + (hashParts.length >= 1 ? ("#" + hashParts.join("#")) : "");



					return '<a href="' + href + '" title="' + stripMarkdown(description) + '">' + escapeOnlySingleElements( linkText ) + '</a>';
				}

				if (httpRegExp.test(name)) {
					linkText = parts && parts[2] ? parts[2] : name;
					href = name;
					return '<a href="' + href + '" title="' + escape(linkText) + '">' + escapeOnlySingleElements( linkText ) + '</a>';
				}

				return match;
			};
			return text.replace(linksRegExp, replacer);
		},
		// helper that creates a link to a docObject
		linkTo: function(name, title, attrs){
			if (!name) return (title || "");
			name = name.replace('::', '.prototype.');
			var docObject = docMap[name];
			if (docObject) {
				if (!attrs) {
					attrs = {};
				}
				if (!attrs.title) {
					var linkTitle = docObject.description || name;
					attrs.title = stripMarkdown(linkTitle);
				}
				var attrsArr = [];
				for(var prop in attrs){
					attrsArr.push(prop+"=\""+attrs[prop]+"\"");
				}
				return '<a href="' + urlTo(name) + '" '+attrsArr.join(" ")+'>' + (title || name ) + '</a>';
			} else {
				return title || name || "";
			}
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.urlTo urlTo
		 *
		 * Returns a url that links to a [bit-docs/types/docObject] name.
		 */
		urlTo: function (name) {
			return urlTo(name);
		},
		// If the current docObject is something
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.ifActive ifActive
		 *
		 * Renders the truthy section if the current item's name matches the
		 * current docObject being rendered
		 *
		 * @param {HandlebarsOptions} options
		 */
		ifActive: function(options){
			if(this.name == getCurrent().name){
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.chain chain
		 *
		 * Chains multiple calls to mustache.
		 *
		 * @signature `{{chain [helperName...] content}}`
		 */
		chain: function(){
			var helpersToCall = [].slice.call(arguments, 0, arguments.length - 2).map(function(name){
				return Handlebars.helpers[name];
			});

			var value = arguments[arguments.length - 2] || "";

			helpersToCall.forEach(function(helper){
				value = helper.call(Handlebars, value);
			});

			return value;
		},
		makeHtml: function(content){
			if(config.showdown) {
				return showdown_to_html(content)
			} else {
				return stmd_to_html(content);
			}
		},
		renderAsTemplate: function(content) {
			var templateRender = config.templateRender || getCurrent().templateRender;
			var renderer;

			if (templateRender === true) {
				// Render {{}} if templateRender tag/option is true
				renderer = Handlebars.compile(content.toString());
				return renderer(docMap);
			} else if (templateRender && templateRender.length === 2) {
				// Render custom delimiters if supplied by templateRender
				var open = new RegExp(templateRender[0], 'g');
				var close = new RegExp(templateRender[1], 'g');
				var toRender = content
						.replace(/{{/g, '\\{\\{')
						.replace(/}}/g, '\\}\\}')
						.replace(open, '{{')
						.replace(close, '}}');
				renderer = Handlebars.compile(toRender);

				return renderer(docMap)
					.replace(/\\{\\{/g, '{{')
					.replace(/\\}\\}/g, '}}');
			} else {
				// Otherwise, just return the content
				return content;
			}
		},
		/**
		 * @function bit-docs-generate-html/build/make_default_helpers.getTitle getTitle
		 *
		 * Returns the parent [bit-docs/types/docObject] title.
		 */
		getTitle: function(){
			var root = docMap[config.parent];
			return (root.title || root.name)+ " - "+(this.title || this.name);
		},
		siteConfig: function(key){
			return _.get(config, key);
		},
		docObjectString: function(){
			this.pathToRoot = pathToRoot(this.name);

			return JSON.stringify(deepExtendWithoutBody(this))
					.replace(/<\/script>/g, "<\\/script>");
		},
		pathToDest: function(){
			var currentDir = path.dirname( path.join(config.dest, docsFilename( getCurrent(), config)) );

			return path.relative(currentDir,config.dest) || ".";
		},
		stripMarkdown: stripMarkdown
	};
	return helpers;
};
