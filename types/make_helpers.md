@parent bit-docs-generate-html/types
@typedef {function(bit-docs/types/docMap,Object,function)} bit-docs-generate-html/types/makeHelpers(docMap,options,getCurrent) MakeHelpers

@param {bit-docs/types/docMap} docMap Contains every
[bit-docs/types/docObject] keyed by its name.

@param {Object} options The options passed to [bit-docs/lib/generate/generate]. 

@param {function():bit-docs/types/docObject} getCurrent Returns the current
[bit-docs/types/docObject] being rendered.

@param {bit-docs-generate-html} helpers The default helpers object that the
return value will be added to.

@return {Object<String,function>} A map of Handlebars function helpers that
will be registered.

@body

## Use

To create a helper that loops through every function's name excluding the
current page's name:

    module.exports = function(docMap,options,getCurrent, defaultHelpers, Handlebars){
      return {
        eachFunction: function(options){
          for(var name in docMap) {
            var docObject = docMap[name];
            if(docObject.type === "function" && name !== getCurrent().name) {
              return options.fn(name);
            }
          }
        }
      };
    };
