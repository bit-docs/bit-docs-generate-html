var generator = require("./html");
var _ = require("lodash");
var tags = require("./tags/tags");

var mergeOnto = function(prop, dest, source){
    if(source[prop]) {
        dest[prop] = dest[prop].concat(source[prop])
    }
};

/**
 * @parent plugins
 * @module {function} bit-docs-generate-html
 * @group bit-docs-generate-html/modules modules
 * @group bit-docs-generate-html/static static
 * @group bit-docs-generate-html/templates templates
 * @group bit-docs-generate-html/types types
 *
 * @description Generates HTML for a docMap.  Supports plugins.
 *
 * @body
 *
 * TBD
 */
module.exports = function(bitDocs){
    bitDocs.register("generator", generator);

    bitDocs.register("tags", tags);

    bitDocs.handle("html", function(siteConfig, htmlConfig) {
        if(!siteConfig.html) {
            siteConfig.html = {
                dependencies: {},
                static: [],
                templates: []
            };
        }
        var html = siteConfig.html;
        _.assign(html.dependencies, htmlConfig.dependencies || {});

        mergeOnto("static", html, htmlConfig);
        mergeOnto("templates", html, htmlConfig);
    });
};
