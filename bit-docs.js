var generator = require("./html");
var _ = require("lodash");
var tags = require("./tags/tags");

var mergeOnto = function(prop, dest, source){
    if(!dest[prop]) {
        dest[prop] = [];
    }
    if(source[prop]) {
        dest[prop] = dest[prop].concat(source[prop]);
    }
};

/**
 * @parent plugins
 * @module {function} bit-docs-generate-html
 * @group bit-docs-generate-html/modules modules
 * @group bit-docs-generate-html/static static
 * @group bit-docs-generate-html/templates templates
 * @group bit-docs-generate-html/generated generated
 * @group bit-docs-generate-html/types types
 *
 * @description Generates HTML for a docMap and handles the `html` hook.
 *
 * @body
 *
 * This plugin registers onto these hooks:
 *   - `tags`
 *   - `generator`
 *
 * Registering the `tags` hook adds the `@templaterender` tag.
 *
 * Registering the `generator` hook makes it so this plugin can generate the
 * HTML output from the provided [bit-docs/types/docMap]. The entry point for
 * this generator is [bit-docs-generate-html/html].
 *
 * This plugin handles the `html` hook, which allows other plugins to hook into
 * the generation process, to do things like include their own static assets,
 * or provide their own mustache templates.
 *
 * This plugin provides a default set of mustache templates and static assets.
 * These mustache templates and less styles can be copied over into a theme
 * plugin and customized. Any custom mustache template will override a default
 * of the same name.
 */
module.exports = function(bitDocs){
    bitDocs.register("generator", generator);

    bitDocs.register("tags", tags);

    bitDocs.handle("html", function(siteConfig, htmlConfig) {
        if(!siteConfig.html) {
            siteConfig.html = {};
        }
        _.defaultsDeep(siteConfig.html, {
                dependencies: {},
                static: [],
                templates: [],
                staticDist: []
        });
        var html = siteConfig.html;
        _.assign(html.dependencies, htmlConfig.dependencies || {});
        mergeOnto("staticDist", html, htmlConfig);
        mergeOnto("static", html, htmlConfig);
        mergeOnto("templates", html, htmlConfig);
    });
};
