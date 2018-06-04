var build = require('./build'),
	makeDefaultHelpers = require("./make_default_helpers"),
	path = require('path'),
	Handlebars = require("handlebars"),
	assert = require('assert'),
	Q = require('q');


var docMap = {
		  "can-core": {
		    "src": {
		      "path": "docs/can-canjs/can-core.md"
		    },
		    "body": "\n## Use\n\nCanJS’s core libraries are the best, most hardened and generally useful modules.  \nEach module is part of an independent package, so you\nshould install the ones you use directly:\n\n```\nnpm install can-define can-set can-connect can-component can-stache can-route --save\n```\n\n\nLet’s explore each module a bit more.\n\n## can-compute\n\n[can-compute]s represent an observable value.  A compute can contain its\nown value and notify listeners of changes like:\n\n```js\nvar compute = require(\"can-compute\");\n\nvar name = compute(\"Justin\");\n\n// read the value\nname() //-> \"Justin\"\n\nname.on(\"change\", function(ev, newVal, oldVal){\n\tnewVal //-> \"Matthew\"\n\toldVal //-> \"Justin\"\n});\n\nname(\"Matthew\");\n```\n\nMore commonly, a compute derives its value from other observables.  The following\n`info` compute derives its value from a `person` map, `hobbies` list, and `age`\ncompute:\n\n```js\nvar DefineMap = require(\"can-define/map/map\"),\n\tDefineList = require(\"can-define/list/list\"),\n\tcompute = require(\"can-compute\");\n\nvar person = new DefineMap({first: \"Justin\", last: \"Meyer\"}),\n\thobbies = new DefineList([\"js\",\"bball\"]),\n\tage = compute(33);\n\nvar info = compute(function(){\n\treturn person.first +\" \"+ person.last+ \" is \"+age()+\n\t\t\"and like \"+hobbies.join(\", \")+\".\";\n});\n\ninfo() //-> \"Justin Meyer is 33 and likes js, bball.\"\n\ninfo.on(\"change\", function(ev, newVal){\n\tnewVal //-> \"Justin Meyer is 33 and likes js.\"\n});\n\nhobbies.pop();\n```\n\n\n## can-define\n\n[can-define/map/map] and [can-define/list/list] allow you to create observable\nmaps and lists with well defined properties.  You can\n[can-define.types.propDefinition define a property’s type initial value, enumerability, getter-setters and much more].\nFor example, you can define the behavior of a `Todo` type and a `TodoList` type as follows:\n\n```js\nvar DefineMap = require(\"can-define/map/map\");\nvar DefineList = require(\"can-define/list/list\");\n\nvar Todo = DefineMap.extend({           // A todo has a:\n  name: \"string\",                       // .name that’s a string\n  complete: {                           // .complete that’s\n\ttype: \"boolean\",                    //        a boolean\n\tvalue: false                        //        initialized to false\n  },                                    \n  dueDate: \"date\",                      // .dueDate that’s a date\n  get isPastDue(){                      // .pastDue that returns if the\n\treturn new Date() > this.dueDate;   //        dueDate is before now\n  },\n  toggleComplete: function(){           // .toggleComplete method that\n    this.complete = !this.complete;     //        changes .complete\n  }\n});\n\nvar TodoList = DefineList.extend({      // A list of todos:     \n  \"#\": Todo,                            // has numeric properties\n                                        //         as todos\n\n  get completeCount(){                  // has .completeCount that\n    return this.filter(\"complete\")      //         returns # of\n\t           .length;                 //         complete todos\n  }\n});\n```\n\nThis allows you to create a Todo, read its properties, and\ncall back its methods like:\n\n```js\nvar dishes = new Todo({\n\tname: \"do dishes\",\n\t// due yesterday\n\tdueDate: new Date() - 1000 * 60 * 60 * 24\n});\ndishes.name      //-> \"do dishes\"\ndishes.isPastDue //-> true\ndishes.complete  //-> false\ndishes.toggleComplete()  \ndishes.complete  //-> true\n```\n\nAnd it allows you to create a `TodoList`, access its items and properties\nlike:\n\n```js\nvar todos = new TodoList( dishes, {name: \"mow lawn\", dueDate: new Date()});\ntodos.length         //-> 2\ntodos[0].complete    //-> true\ntodos.completeCount //-> 1\n```\n\nThese observables provide the foundation\nfor data connection (models), view-models and even routing in your application.\n\n## can-set\n\n[can-set] models a service layer’s behavior as a [can-set.Algebra set.Algebra]. Once modeled, other libraries such as [can-connect] or [can-fixture] can\nadd a host of functionality like: real-time behavior, performance optimizations, and\nsimulated service layers.\n\nA `todosAlgebra` set algebra for a `GET /api/todos` service might look like:\n\n```js\nvar set = require(\"can-set\");\nvar todosAlgebra = new set.Algebra(\n    // specify the unique identifier property on data\n    set.prop.id(\"_id\"),  \n    // specify that completed can be true, false or undefined\n    set.prop.boolean(\"complete\"),\n    // specify the property that controls sorting\n    set.prop.sort(\"orderBy\")\n)\n```\n\nThis assumes that the service:\n\n - Returns data where the unique property name is `_id`:\n   ```js\n   GET /api/todos\n   -> [{_id: 1, name: \"mow lawn\", complete: true},\n       {_id: 2, name: \"do dishes\", complete: false}, ...]\n   ```\n - Can filter by a `complete` property:\n   ```js\n   GET /api/todos?complete=false\n   -> [{_id: 2, name: \"do dishes\", complete: false}, ...]\n   ```\n - Sorts by an `orderBy` property:\n   ```js\n   GET /api/todos?orderBy=name\n   -> [{_id: 2, name: \"do dishes\", complete: false},\n       {_id: 1, name: \"mow lawn\", complete: true}]\n   ```\n\nIn the next section will use `todoAlgebra` to build a model with [can-connect].\n\n## can-connect\n\n[can-connect] connects a data type, typically a `DefineMap` and its `DefineList`,\nto a service layer. This is often done via the\n[can-connect/can/base-map/base-map] module which bundles many common behaviors\ninto a single api:\n\n```js\nvar baseMap = require(\"can-connect/can/base-map/base-map\"),\n    DefineMap = require(\"can-define/map/map\"),\n    DefineList = require(\"can-define/list/list\"),\n\tset = require(\"can-set\");\n\nvar Todo = DefineMap.extend({\n\t...\n});\nvar TodosList = DefineMap.extend({\n\t\"#\": Todo,\n\t...\n});\nvar todosAlgebra = new set.Algebra({\n\t...\n});\n\nvar connection = baseMap({\n\turl: \"/api/todos\",\n\tMap: Todo,\n\tList: TodoList,\n\talgebra: todosAlgebra,\n\tname: \"todo\"\n});\n```\n\n`baseMap` extends the `Map` type, in this case, `Todo`, with\nthe ability to make requests to the service layer.\n\n - [can-connect/can/map/map.getList Get a list] of Todos\n   ```js\n   Todo.getList({complete: true}).then(function(todos){})\n   ```\n - [can-connect/can/map/map.get Get] a single Todo\n   ```js\n   Todo.get({_id: 6}).then(function(todo){})\n   ```\n - [can-connect/can/map/map.prototype.save Create] a Todo\n   ```js\n   var todo = new Todo({name: \"do dishes\", complete: false})\n   todo.save().then(function(todo){})\n   ```\n - [can-connect/can/map/map.prototype.save Update] an [can-connect/can/map/map.prototype.isNew already created] Todo\n   ```js\n   todo.complete = true;\n   todo.save().then(function(todo){})\n   ```\n - [can-connect/can/map/map.prototype.destroy Delete] a Todo\n   ```js\n   todo.destroy().then(function(todo){})\n   ```\n\n[can-connect] is also middleware, so custom connections can\nbe assembled too:\n\n```js\nvar base = require(\"can-connect/base/base\");\nvar dataUrl = require(\"can-connect/data-url/data-url\");\nvar constructor = require(\"can-connect/constructor/constructor\");\nvar map = require(\"can-connect/can/map/map\");\n\nvar options = {\n\turl: \"/api/todos\",\n\tMap: Todo,\n\tList: TodoList,\n\talgebra: todosAlgebra,\n\tname: \"todo\"\n}\nvar connection = map(constructor(dataUrl(base(options))));\n```\n\n## can-stache\n\n[can-stache] provides live binding mustache and handlebars syntax. While\ntemplates should typically be loaded with a module loader like [steal-stache],\nyou can create a template programmatically that lists out todos within a\npromise loaded from `Todo.getList` like:\n\n```js\nvar stache = require(\"can-stache\");\n\n// Creates a template\nvar template = stache(\n\t\"<ul>\"+\n\t\t\"{{#if todos.isPending}}<li>Loading…</li>{{/if}}\"+\n\t\t\"{{#if todos.isResolved}}\"+\n\t\t\t\"{{#each todos.value}}\"+\n\t\t\t\t\"<li class='{{#complete}}complete{{/complete}}'>{{name}}</li>\"+\n\t\t\t\"{{else}}\"+\n\t\t\t\t\"<li>No todos</li>\"+\n\t\t\t\"{{/each}}\"+\n\t\t\"{{/if}}\"+\n\t\"</ul>\");\n\n// Calls the template with some data\nvar frag = template({\n\ttodos: Todo.getList({})\n});\n\n// Inserts the result into the page\ndocument.body.appendChild(frag);\n```\n\n[can-stache] templates use magic tags like `{{}}` to control what\ncontent is rendered. The most common forms of those magic tags are:\n\n - [can-stache.tags.escaped {{key}}] - Insert the value at `key` in the page. If `key` is a function or helper, run it and insert the result.\n - [can-stache.tags.section {{#key}}...{{/key}}] - Render the content between magic tags based on some criteria.  \n\n[can-stache] templates return document fragments that update whenever\ntheir source data changes.\n\n## can-component\n\n[can-component] creates custom elements with unit-testable view models. It\ncombines a view model created by [can-define/map/map] with a template\ncreated by [can-stache].\n\n```js\nvar Component = require(\"can-component\");\nvar DefineMap = require(\"can-define/map/map\");\nvar stache = require(\"can-stache\");\n\n// Defines the todos-list view model\nvar TodosListVM = DefineMap.extend({\n\t// An initial value that is a promise containing the\n\t// list of all todos.\n\ttodos: {\n\t\tvalue: function(){\n\t\t\treturn Todo.getList({});\n\t\t}\n\t},\n\t// A method that toggles a todo’s complete property\n\t// and updates the todo on the server.\n\ttoggleComplete: function(todo){\n\t\ttodo.complete = !todo.complete;\n\t\ttodo.save();\n\t}\n});\n\nComponent.extend({\n\ttag: \"todos-list\",\n\tViewModel: TodosVM,\n\tview: stache(\n\t\t\"<ul>\"+\n\t\t\t\"{{#if todos.isPending}}<li>Loading…</li>{{/if}}\"+\n\t\t\t\"{{#if todos.isResolved}}\"+\n\t\t\t\t\"{{#each todos.value}}\"+\n\t\t\t\t\t\"<li ($click)='toggleComplete(.)'\"+\n\t\t\t\t\t     \"class='{{#complete}}complete{{/complete}}'>{{name}}</li>\"+\n\t\t\t\t\"{{else}}\"+\n\t\t\t\t\t\"<li>No todos</li>\"+\n\t\t\t\t\"{{/each}}\"+\n\t\t\t\"{{/if}}\"+\n\t\t\"</ul>\");\n});\n```\n\n## can-stache-bindings\n\n[can-stache-bindings] provides [can-view-callbacks.attr custom attributes] for\n[can-stache] event and data bindings.\n\nBindings look like:\n\n - `(event)=\"key()\"` for [can-stache-bindings.event event binding].\n - `{prop}=\"key\"` for [can-stache-bindings.toChild one-way binding to a child].\n - `{^prop}=\"key\"` for [can-stache-bindings.toParent one-way binding to a parent].\n - `{(prop)}=\"key\"` for [can-stache-bindings.twoWay two-way binding].\n\nAdding `$` to a binding like `($event)=\"key()\"` changes the binding from the viewModel to the element’s attributes or properties.\n\n[can-stache-bindings.event Event] binding examples:\n\n```html\n<!-- calls `toggleComplete` when the li is clicked -->\n<li ($click)=\"toggleComplete(.)\"/>\n\n<!-- calls `resetData` when cancel is dispatched on `my-modal`’s view model -->\n<my-modal (cancel)=\"resetData()\"/>\n```\n\n[can-stache-bindings.toChild One-way to child] examples:\n\n```html\n<!-- updates input’s `checked` property with the value of complete -->\n<input type=\"checkbox\" {$checked}=\"complete\"/>\n\n<!-- updates `todo-lists`’s  `todos` property with the result of `getTodos`-->\n<todos-list {todos}=\"getTodos(complete=true)\"/>\n```\n\n[can-stache-bindings.toChild One-way to parent] examples:\n\n```html\n<!-- updates `complete` with input’s `checked` property -->\n<input type=\"checkbox\" {^$checked}=\"complete\"/>\n\n<!-- updates `todosList` with `todo-lists`’s `todos` property -->\n<todos-list {^todos}=\"todosList\"/>\n```\n\n[can-stache-bindings.twoWay Two-way] examples:\n\n```html\n<!-- Updates the input’s `value` with `name` and vice versa -->\n<input type=\"text\" {($value)}=\"name\"/>\n\n<!-- Updates `date-picker`’s `date` with `dueDate` and vice versa -->\n<date-picker {(date)}=\"dueDate\"/>\n```\n\n## can-route and can-route-pushstate\n\n[can-route] connects a `DefineMap`’s properties to values in the\nurl. Create a map type, [canjs/doc/can-route.map connect it to the url], and [can-route.ready begin routing] like:\n\n```js\nvar route = require(\"can-route\");\nvar DefineMap = require(\"can-define/map/map\");\n\nvar AppViewModel = DefineMap.extend({\n\tseal: false\n},{\n\t// Sets the default type to string\n\t\"#\": \"string\",\n\ttodoId: \"string\",\n\ttodo: {\n\t\tget: function(){\n\t\t\tif(this.todoId) {\n\t\t\t\treturn Todo.get({_id: this.todoId})\n\t\t\t}\n\t\t}\n\t}\n});\n\nvar appViewModel = new AppViewModel();\nroute.map(appViewModel);\n\nroute.ready();\n```\n\nWhen the url changes, to something like `#!&todoId=5`, so will the\n`appViewModel`’s `todoId` and `todo` property:\n\n```js\nappViewModel.todoId //-> \"5\"\nappViewModel.todo   //-> Promise<Todo>\n```\n\nSimilarly, if `appViewModel`’s `todoId` is set like:\n\n```js\nappViewModel.todoId = 6;\n```\n\nThe hash will be updated:\n\n```js\nwindow.location.hash //-> \"#!&todoId=6\"\n```\n\nThe `route` function can be used to specify pretty routing rules that\ntranslate property changes to a url and a url to property changes. For example,\n\n```js\n// a route like:\nroute(\"todo/{todoId}\");\n\n// and a hash like:\nwindow.location.hash = \"#!todo/7\";\n\n// produces an appViewModel like:\nappViewModel.serialize() //-> {route: \"todo/{todoId}\", todoId: \"7\"}\n```\n\n[can-route-pushstate] adds [pushstate](https://developer.mozilla.org/en-US/docs/Web/API/History_API) support. It\nmixes in this behavior so you just need to import the module:\n\n```js\nvar route = require(\"can-route\");\nrequire(\"can-route-pushstate\");\n```\n\n\n## Want to learn more?\n\nIf you haven’t already, check out the [guides] page on how to learn CanJS.  Specifically, you’ll\nwant to check out the [guides/chat] and [guides/todomvc] to learn the basics of using CanJS’s\ncore libraries.  After that, check out the [guides/api] on how to use and learn from these API docs.\n\n",
		    "description": "Simply the Best",
		    "name": "can-core",
		    "title": "Core",
		    "type": "page",
		    "parent": "canjs",
		    "order": 2,
		    "templateRender": [
		      "<%",
		      "%>"
		    ],
		    "comment": " "
		  },
		  "can-element": {
			name: "can-element",
			title: "<can-element>",
			description: "custom elements"
		  }
		},
		siteConfig = {
			dest: path.join(__dirname, "test_tmp"),
			devBuild: true,
			minify: false,
			parent: "index",
			forceBuild: true
		},
		defaultHelpers;

var currentDocObject,
		getCurrent = function(){
			return currentDocObject;
		},
		setCurrent = function(current){
			currentDocObject = current;
		};

setCurrent(docMap["can-core"]);

describe("documentjs/lib/generators/html/build/make_default_helpers",function(){
	before(function(done){
		build.templates(siteConfig).then(function(){
			return Handlebars.create();
		}).then(function(Handlebars){
			defaultHelpers = makeDefaultHelpers(docMap, siteConfig, getCurrent, Handlebars);
			done();
		});
	});

	beforeEach(function(done){
		done();
	});

	it("makeLinks handles [document-name Link Text] format",function(done){
		var md = "[can-core Link Text]",
				expected = '<a href="can-core.html" title="Simply the Best">Link Text</a>',
				actual = defaultHelpers.makeLinks(md);
		assert.equal(actual, expected);
		done();
	});

	it("makeLinks handles [document-name#linkId Link Text] format (#27)",function(done){
		var md = "[can-core#someId Link Text]",
				expected = '<a href="can-core.html#someId" title="Simply the Best">Link Text</a>',
				actual = defaultHelpers.makeLinks(md);
		assert.equal(actual, expected);
		done();
	});

	it("makeLinks handles [document-name#linkId Link Text] format (#27)",function(done){
		var md = "[can-core#someId Link Text]",
				expected = '<a href="can-core.html#someId" title="Simply the Best">Link Text</a>',
				actual = defaultHelpers.makeLinks(md);
		assert.equal(actual, expected);
		done();
	});

	it("makeLinks handles titles that are custom elements without dashes are not escaped", function(done){
		var md = "[can-element]",
				expected = '<a href="can-element.html" title="custom elements"><can-element></a>',
				actual = defaultHelpers.makeLinks(md);
		assert.equal(actual, expected);
		done();
	})

});
