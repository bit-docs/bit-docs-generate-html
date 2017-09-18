/**
 * @parent bit-docs-generate-html/modules
 * @module {{}} bit-docs-generate-html/html
 * 
 * A collection of helpers used to build and compile the templates used to
 * render each [bit-docs/types/docObject] into HTML and build the static JS and
 * CSS used by that HTML.
 * 
 * @body
 * 
 * Requires and exports these other modules:
 * - [bit-docs-generate-html/build/build] as `build`.
 * - [bit-docs-generate-html/write/write] as `write`.
 * - [bit-docs-generate-html/generate] as `generate`.
 */
exports.build = require("./build/build");
exports.write = require("./write/write");
exports.generate = require("./generate");
