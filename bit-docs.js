var generator = require("./html");
var _ = require("lodash");

var mergeOnto = function(prop, dest, source){
    if(source[prop]) {
        dest[prop] = dest[prop].concat(source[prop])
    }
};

module.exports = function(bitDocs){
    bitDocs.register("generator", generator );

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
