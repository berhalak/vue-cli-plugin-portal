const code = require('./code');

module.exports = function (this: any, source: string) {
	let vue = this?.resource?.split("?")[0] ?? "";
	if (vue.includes("node_modules")) {
		return source;
	}
	return code.rewrite(source);
};