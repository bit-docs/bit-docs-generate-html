@parent bit-docs-generate-html/site/static/build/buildHash
@module bit-docs-generate-html/site/static/build/buildHash/package.json

@description A modified copy of
[bit-docs-generate-html/site/default/static/package.json].

@body

Gets updated with any plugins that hooked into `dependencies` of the `html`
hook:

```js
{
  "name": "bit-docs-site",
  "version": "0.0.1",
  "description": "A site to be built",
  "main": "static.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "steal": {
    "plugins": [
      "steal-less"
    ]
  },
  "author": "Bitovi",
  "license": "MIT",
  "dependencies": {
    "steal": "1.X",
    "steal-less": "1.X",
    "bit-docs-html-toc": "0.6.2",
    "bit-docs-js": "0.0.6",
    "bit-docs-prettify": "0.1.1",
    "bit-docs-html-highlight-line": "0.2.3",
    "bit-docs-tag-demo": "0.3.0"
  }
}
```

The listed dependencies are installed by bit-docs using
[enpeem](https://www.npmjs.com/package/enpeem) which makes them available for
use by [steal](https://stealjs.com/) on the front end of the generated
website.
