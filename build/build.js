/**
 * @parent bit-docs-generate-html/modules
 * @module {{}} bit-docs-generate-html/build/build
 * 
 * A collection of helpers used to build and compile the templates used to
 * render each [bit-docs/types/docObject] into HTML and build the static JS and
 * CSS used by that HTML.
 * 
 * @body
 * 
 * Requires and exports these other modules:
 * - [bit-docs-generate-html/build/renderer] as `renderer`.
 * - [bit-docs-generate-html/build/static_dist] as `staticDist`.
 * - [bit-docs-generate-html/build/templates] as `templates`.
 * - [bit-docs-generate-html/build/helpers] as `helpers`.
 */
exports.renderer = require("./renderer");
exports.staticDist = require("./static_dist");
exports.templates = require("./templates");
exports.helpers = require("./helpers");
