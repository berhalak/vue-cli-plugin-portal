"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
    var templates = {};
    // load vue template, wrap it in body, for use in html method at the end (html renders inner content)
    var $ = cheerio.load("<body>" + template + "</body>", { recognizeSelfClosing: true, xmlMode: true, decodeEntities: false });
    function findTemplates() {
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
                var html = $(e).toString();
                var encoded = source.includes("${");
                templates[refName] = {
                    html: html,
                    element: e,
                    encoded: encoded,
                };
            }
            return null;
        });
    }
    function assemble(literal, params) {
        return new (Function.bind.apply(Function, __spreadArrays([void 0], params, ["return `" + literal + "`;"])))(); // TODO: Proper escaping
    }
    function modifyAllTags() {
        // get the template node
        var template = $("template")[0];
        // traverse all tags
        traverse(template, function (ref) {
            // make sure it is valid
            if (!ref || !ref.tagName || ref.type != "tag") {
                return null;
            }
            var isRef = ref.tagName == "ref";
            if (isRef) {
                var name_1 = ref.attribs["name"];
                if (templates[name_1]) {
                    if (templates[name_1].encoded) {
                        var names = Object.keys(ref.attribs).filter(function (x) { return x != "name"; });
                        var values = Object.entries(ref.attribs).filter(function (x) { return x[0] != "name"; }).map(function (x) { return x[1]; });
                        // add content
                        names.push("content");
                        var content = $(ref).html();
                        values.push(content);
                        var fun = assemble(templates[name_1].html, names);
                        var filled = fun.apply(void 0, values);
                        $(ref).replaceWith(filled);
                    }
                    else {
                        $(ref).replaceWith(templates[name_1].html);
                    }
                }
            }
            return null;
        });
    }
    // first read all aliases
    findTemplates();
    // then go through every tag and modify this according to the definition
    modifyAllTags();
    for (var _i = 0, _a = Object.values(templates).map(function (x) { return x.element; }); _i < _a.length; _i++) {
        var t = _a[_i];
        $(t).remove();
    }
    // now serialize body content to html
    var result = $("body").html();
    result = source.replace(template, result);
    return result;
}
exports.rewrite = rewrite;
//# sourceMappingURL=code.js.map