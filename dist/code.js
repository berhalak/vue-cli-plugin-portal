"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = __importStar(require("cheerio"));
// traverse all elements in cherrio dom
function traverse(element, visitor) {
    var result = visitor(element);
    if (result)
        return result;
    if (element.childNodes) {
        for (var _i = 0, _a = element.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            result = traverse(child, visitor);
            if (result)
                return result;
        }
    }
    return null;
}
function rewrite(source) {
    var isUpper = source.startsWith("<template alias upper") || source.startsWith("<template alias=\"\" upper=\"\"");
    var template = source.match(/<template>.*<\/template>/s);
    if (template && template.length) {
        template = template[0];
    }
    else {
        return source;
    }
    // define aliases dictionary	
    var refs = {};
    // load vue template, wrap it in body, for use in html method at the end (html renders inner content)
    var $ = cheerio.load("<body>" + template + "</body>", { recognizeSelfClosing: true, xmlMode: true, decodeEntities: false });
    function findRefs() {
        // get global template
        var template = $("template")[0];
        traverse(template, function (e) {
            // make sure that it is proper tag
            if (!e || !e.tagName || e.type != "tag") {
                return null;
            }
            // if this is an inline alias (started with a, for example a-header)
            // add this as inline
            var refName = e.attribs["ref"];
            if (refName) {
                refs[refName] = e;
            }
            return null;
        });
    }
    function modifyAllTags() {
        // get the template node
        var template = $("template")[0];
        // traverse all tags
        traverse(template, function (element) {
            // make sure it is valid
            if (!element || !element.tagName || element.type != "tag") {
                return null;
            }
            var isRef = element.tagName == "ref";
            if (isRef) {
                var name_1 = element.attribs["name"];
                if (refs[name_1]) {
                    $(element).replaceWith(refs[name_1]);
                }
            }
            return null;
        });
    }
    // first read all aliases
    findRefs();
    // then go through every tag and modify this according to the definition
    modifyAllTags();
    // now serialize body content to html
    var result = $("body").html();
    result = source.replace(template, result);
    return result;
}
exports.rewrite = rewrite;
//# sourceMappingURL=code.js.map