module.exports = {
    add: function(line, curData, scope, objects, currentWrite) {
		var args = line.replace(/@templaterender/i, "").trim().split(' ').map(function(x) {
			return x.trim();
		});

		if (!args[0] || args[0] === "true") {
			curData.templateRender = true;
		} else if (args.length === 2) {
			curData.templateRender = args;
		} else {
			throw new Error('Invalid arguments for @templateRender: ', args);
		}
    }
};
