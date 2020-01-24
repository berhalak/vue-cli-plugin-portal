const code = require('./code');

module.exports = function (source: string) {
	return code.rewrite(source);
};