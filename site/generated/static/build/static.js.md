@parent bit-docs-generate-html/site/static/build/buildHash
@module bit-docs-generate-html/site/static/build/buildHash/static.js

@description An unmodified copy of
[bit-docs-generate-html/site/default/static/static.js].

@body

Tells steal to require
[bit-docs-generate-html/site/static/build/buildHash/packages.js] and
`styles.less` from
[bit-docs-generate-html/site/static/build/buildHash/styles], and sets up a
global `window.PACKAGES` variable:

```js
var packages = require("./packages");
require("./styles/styles.less!");
window.PACKAGES = packages;
```

Gets compiled by steal, and becomes
[bit-docs-generate-html/site/static/dist/buildHash/bundles/bit-docs-site/static.js]
