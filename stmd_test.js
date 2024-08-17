var assert = require('assert');

var stmd = require("./stmd");

describe("bit-docs-generate-html/stmd", function () {
	it("adds id attributes to heading elements", function () {
		var parser = new stmd.DocParser();
		var renderer = new stmd.HtmlRenderer();
		var markdown = "# Hello world"
		var rendered = renderer.render(parser.parse(markdown));
		var expected = '<h1 id="hello-world">Hello world</h1>';
		assert.equal(rendered.trim(), expected, "id attributes are present");
	});
});
