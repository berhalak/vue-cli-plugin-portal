"use strict";
var code = require('./code');
module.exports = function (source) {
    var _a, _b;
    var vue = (_b = (_a = this === null || this === void 0 ? void 0 : this.resource) === null || _a === void 0 ? void 0 : _a.split("?")[0]) !== null && _b !== void 0 ? _b : "";
    if (vue.includes("node_modules")) {
        return source;
    }
    return code.rewrite(source);
};
//# sourceMappingURL=loader.js.map