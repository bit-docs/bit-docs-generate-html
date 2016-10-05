var processTags = require("bit-docs-process-tags");
var render = require("./template_render");
var assert = require("assert");

describe("templateRender", function() {
    it("adds templateRender without args", function() {
        var body = generateProcessBody('');
        processTags(body, function(newDoc, newScope) {
            assert.ok(newDoc.templateRender === true);
		});
	});

    it("adds templateRender with true", function() {
        var body = generateProcessBody('true');
		processTags(body, function(newDoc, newScope) {
            assert.ok(newDoc.templateRender === true);
		});
	});

    it("adds templateRender with delimiters and trimming", function() {
        var body = generateProcessBody('     <% %>  ');
		processTags(body, function(newDoc, newScope) {
            assert.ok(newDoc.templateRender.length === 2);
            assert.ok(newDoc.templateRender[0] === '<%');
            assert.ok(newDoc.templateRender[1] === '%>');
		});
	});

    it("throws error with malformed args", function() {
        var processFunc = function() {
            var body = generateProcessBody('<%%>');
            processTags(body, function(newDoc, newScope) {});
        };
		assert.throws(processFunc);
	});
});

function generateProcessBody(str) {
    return {
        comment: "@constructor\n@templateRender "+str,
        scope: {},
        docMap: {},
        docObject: {
            src: {
                path: './'
            }
        },
        tags: {
            templaterender: render,
            constructor: {
                add : function() {
                    this.name = "constructed";
                    this.type = "constructor";
                    return ["scope", this];
                }
            }
        }
    };
}
