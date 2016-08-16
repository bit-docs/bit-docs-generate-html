module.exports = function deepExtendWithoutBody(obj){
	if(!obj || typeof obj != "object"){
		return obj;
	}
	var isArray = obj.map && typeof obj.length == "number";
	if(isArray){
		return obj.map(function(item){
			return deepExtendWithoutBody(item);
		});
	} else {
		var clone = {};
		for(var prop in obj){
			if(prop != "body" && prop != "children" && prop != "content"){
				clone[prop] = deepExtendWithoutBody(obj[prop]);
			}

		}
		return clone;
	}
};
