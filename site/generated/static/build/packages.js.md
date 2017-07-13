@parent bit-docs-generate-html/site/static/build/buildHash
@module {{}} bit-docs-generate-html/site/static/build/buildHash/packages.js

@description A modified copy of
[bit-docs-generate-html/site/default/static/packages.js].

@body

Depending on what plugins you're using, gets updated to look like this:

```js
function callIfFunction(value){
  if(typeof value === "function") {
	value();
  }
  return value;
}
module.exports = {
	"bit-docs-html-toc": callIfFunction( require("bit-docs-html-toc") ),
	"bit-docs-js": callIfFunction( require("bit-docs-js") ),
	"bit-docs-prettify": callIfFunction( require("bit-docs-prettify") ),
	"bit-docs-html-highlight-line": callIfFunction( require("bit-docs-html-highlight-line") ),
	"bit-docs-tag-demo": callIfFunction( require("bit-docs-tag-demo") )};
```

This generated module requires front end plugins and calls them if the `main`
of their `package.json` points to a JavaScript file that exports a function.
For an example of a plugin that exports a front end function, see
[bit-docs-prettify/prettify.js].
