@parent bit-docs-generate-html/types
@typedef {function(bit-docs/types/docObject)} bit-docs-generate-html/types/renderer(docObject) renderer

A renderer built by [bit-docs-generate-html/build/renderer] that is used to
render each [bit-docs/types/docObject].

@param {bit-docs/types/docObject} docObject The
[bit-docs/types/tagCollection] data of a comment.

@return {String} The HTML to be outputted.

@body

## Properties

A renderer function also has a `.layout` property which can be used to render
the `layout` template and a `.content` property that can be used to render
the `content` template.
