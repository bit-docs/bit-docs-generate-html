var packages = require("./packages");
require("./styles/styles.less!");
window.PACKAGES = packages;

// sets sidebar height to window height
function setSidebarHeightOnResize() {
	var windowHeight = window.innerHeight;
	document.getElementsByClassName("sidebar")[0].style.height = windowHeight + "px";
}
setSidebarHeightOnResize();
window.onresize = function() {
	setSidebarHeightOnResize();
};
