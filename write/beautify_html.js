var _ = require("lodash");

/**
 * Returns js-beautify options object
 *
 * @param {{}} siteConfig The site configuration object
 * @returns {{}} The js-beautify options object
 *
 * Options can be provided through the `beautifyHtml` object, if no
 * options were provided some defaults are set.
 */
function getOptions(siteConfig) {
	var opts = _.isObject(siteConfig.beautifyHtml) ?
		siteConfig.beautifyHtml : {};

	return _.defaults(opts, {
		"indent_size": 2,
		"max_preserve_newlines": 1,
		"indent_scripts": "keep"
	});
}

/**
 * Beautifies html through js-beautify
 *
 * @param {string} rendered The rendered html string
 * @param {{}} The site configuration object
 */
module.exports = function(rendered, siteConfig) {
	var beautify = siteConfig.beautifyHtml === true ||
		_.isObject(siteConfig.beautifyHtml);

	if (beautify) {
		var beautifier = require("js-beautify").html;

		return beautifier(rendered, getOptions(siteConfig));
	}
	else {
		return rendered;
	}
};
