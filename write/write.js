/**
 * @parent bit-docs-generate-html/modules
 * @module {{}} bit-docs-generate-html/write/write
 *
 * A collection of helpers used to write out [bit-docs/types/docObject] and
 * [bit-docs/types/docMap]s using the structures produced by
 * [bit-docs-generate-html/build/build].
 *
 * @body
 * 
 * Requires and exports these other modules:
 * - [bit-docs-generate-html/write/doc_map] as `docMap`.
 * - [bit-docs-generate-html/write/doc_object] as `docObject`.
 * - [bit-docs-generate-html/write/static_dist] as `staticDist`.
 * - [bit-docs-generate-html/write/search_map] as `searchMap`.
 */
exports.docMap = require("./doc_map");
exports.docObject = require("./doc_object");
exports.staticDist = require("./static_dist");
