var _ = require("lodash"),
	path = require("path"),
	stmd_to_html = require("../stmd_to_html"),
	deepExtendWithoutBody = require("./deep_extend_without_body"),
	escape = require('escape-html'),
	striptags = require('striptags');

// Helper helpers



var sortChildren = function(child1, child2){

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

var linksRegExp = /[\[](.*?)\]/g,
	linkRegExp = /^(\S+)\s*(.*)/,
	httpRegExp = /^http/;

/**
* @add documentjs.generators.html.defaultHelpers
*/
module.exports = function(docMap, config, getCurrent, Handlebars){

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
			str = str.replace(/[\[]|[\]]/g, '');
			var parts = str.match(linkRegExp);
			if (parts && parts[2]) {
				return parts[2];
			}
			return parts[1].split('\/').pop();
		});
		return striptags(html).trim();
	};

	var helpers = {
		// GENERIC HELPERS
		/**
		* @function documentjs.generators.html.defaultHelpers.ifEqual
		*/
		ifEqual: function( first, second, options ) {
			if(first == second){
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
		/**
		* @function documentjs.generators.html.defaultHelpers.ifAny
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
		* @function documentjs.generators.html.defaultHelpers.ifNotEqual
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
		 * @function documentjs.generators.html.defaultHelpers.generatedWarning
		 * @signature `{{{generatedWarning}}}`
		 *
		 * @body
		 *
		 * ## Use
		 * ```
		 * {{{generatedWarning}}}
		 * ```
		 * MUST use triple-braces to escape HTML so it is hidden in a comment.
		 *
		 * Creates a warning that looks like this:
		 *
		 * ```
		 * <!--####################################################################
		 * THIS IS A GENERATED FILE -- ANY CHANGES MADE WILL BE OVERWRITTEN
		 *
		 * INSTEAD CHANGE:
		 * source: lib/tags/iframe.js
		 * @@constructor documentjs.tags.iframe
		 * ######################################################################## -->
		 * ```
		 */
		generatedWarning: function(){
			var current = getCurrent();
			return "<!--####################################################################\n" +
						 "\tTHIS IS A GENERATED FILE -- ANY CHANGES MADE WILL BE OVERWRITTEN\n\n" +
						 '\tINSTEAD CHANGE:\n' +
						 "\tsource: " + current.src +
						 (current.type ? '\n\t@' + current.type + " " + current.name : '') +
						 "\n######################################################################## -->";
		},
		/**
		* @function documentjs.generators.html.defaultHelpers.makeTitle
		* Given the docObject context, returns a "pretty" name that is used
		* in the sidebar and the page header.
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
		* @function documentjs.generators.html.defaultHelpers.makeLinks
		* Looks for links like [].
		*/
		makeLinks: function(text){
			if (!text) return "";
			var replacer = function (match, content) {
				var parts = content.match(linkRegExp),
					name,
					description,
					linkText,
					docObject;

				name = parts ? parts[1].replace('::', '.prototype.') : content;

				docObject = docMap[name]
				if (docObject) {
					linkText = parts && parts[2] ? parts[2] : docObject.title || name;
					description = docObject.description || name;

					return '<a href="' + urlTo(name) + '" title="' + stripMarkdown(description) + '">' + linkText + '</a>';
				}

				if (httpRegExp.test(name)) {
					linkText = parts && parts[2] ? parts[2] : name;
					return '<a href="' + name + '" title="' + escape(linkText) + '">' + linkText + '</a>';
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
					console.log('doing this for ', name);
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
		* @function documentjs.generators.html.defaultHelpers.urlTo
		*
		* Returns a url that links to a docObject's name.
		*/
		urlTo: function (name) {
			return urlTo(name);
		},
		// If the current docObject is something
		/**
		* @function documentjs.generators.html.defaultHelpers.ifActive
		*
		* Renders the truthy section if the current item's name matches
		* the current docObject being rendered
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
		* @function documentjs.generators.html.defaultHelpers.chain
		*
		* Chains multiple calls to mustache.
		*
		* @signature `{{chain [helperName...] content}}`
		*
		*/
		chain: function(){
			var helpersToCall = [].slice.call(arguments, 0, arguments.length - 2).map(function(name){
				return Handlebars.helpers[name];
			}),
				value = arguments[arguments.length - 2] || "";

			helpersToCall.forEach(function(helper){
				value = helper.call(Handlebars, value);
			});

			return value;
		},
		makeHtml: function(content){
			return stmd_to_html(content);
		},
		renderAsTemplate: function(content) {
			var templateRender = config.templateRender || getCurrent().templateRender,
				renderer;

			if (templateRender === true) {
				// Render {{}} if templateRender tag/option is true
				renderer = Handlebars.compile(content.toString());
				return renderer(docMap);
			} else if (templateRender && templateRender.length === 2) {
				// Render custom delimiters if supplied by templateRender
				var open = new RegExp(templateRender[0], 'g'),
					close = new RegExp(templateRender[1], 'g'),
					toRender = content
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
		* @function documentjs.generators.html.defaultHelpers.makeParentTitle
		*
		* Returns the parent docObject's title.
		*
		*/
		getTitle: function(){
			var root = docMap[config.parent];
			return (root.title || root.name)+ " - "+(this.title || this.name);
		},
		docObjectString: function(){
			this.pathToRoot = pathToRoot(this.name);
			return JSON.stringify(deepExtendWithoutBody(this)).replace("</script>", "<\\/script>");
		},
		pathToDest: function(){
			var currentDir = path.dirname( path.join(config.dest, docsFilename( getCurrent(), config)) );

			return path.relative(currentDir,config.dest) || ".";
		},
		stripMarkdown: stripMarkdown
	};
	return helpers;
};
