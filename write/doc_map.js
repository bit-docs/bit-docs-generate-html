var writeDocObject = require("./doc_object");
var Q = require("q");

/**
 * @parent bit-docs-generate-html/modules
 * @module {function} bit-docs-generate-html/write/doc_map
 *
 * Writes out every [bit-docs/types/docObject] within a
 * [bit-docs/types/docMap].
 *
 * @signature `docMap(docMap, renderer, siteConfig, setCurrentDocObjectForHelpers)`
 *
 * @param {bit-docs/types/docMap} docMap
 * @param {bit-docs-generate-html/types/renderer} renderer
 * @param {Object} siteConfig
 * @param {function(bit-docs/types/docObject)} setCurrentDocObjectForHelpers
 * 
 * @return {Promise} Resolves when all [bit-docs/types/docObject]s have been
 * written.
 */
module.exports = function(docMap, renderer, siteConfig, setCurrentDocObjectForHelpers){

	var promises = [];
	if(siteConfig.singlePage) {
		var parent = docMap[siteConfig.parent];
		parent.docMap = docMap;
		return writeDocObject(parent, renderer, siteConfig, setCurrentDocObjectForHelpers);
	} else {
		// Go through each object and write it out.
		for(var name in docMap){
			var docObject = docMap[name];
			promises.push(writeDocObject(docObject, renderer, siteConfig, setCurrentDocObjectForHelpers));
		}
		return Q.all(promises);
	}


};
