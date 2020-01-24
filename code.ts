import * as cheerio from "cheerio"

// traverse all elements in cherrio dom
function traverse(element: CheerioElement, visitor: (e: CheerioElement) => CheerioElement | null): CheerioElement | null {
	let result = visitor(element);
	if (result) return result;
	if (element.childNodes) {
		for (const child of element.childNodes) {
			result = traverse(child, visitor);
			if (result) return result;
		}
	}
	return null;
}

function rewrite(source: string): string {


	const isUpper = source.startsWith("<template alias upper") || source.startsWith(`<template alias="" upper=""`);

	let template: any = source.match(/<template>.*<\/template>/s);

	if (template && template.length) {
		template = template[0] as string;
	} else {
		return source;
	}

	// define aliases dictionary	
	const templates: {
		[key: string]: {
			html: string,
			element: CheerioElement,
			encoded: boolean
		}
	} = {};

	// load vue template, wrap it in body, for use in html method at the end (html renders inner content)
	const $ = cheerio.load(`<body>${template}</body>`, { recognizeSelfClosing: true, xmlMode: true, decodeEntities: false });



	function findTemplates() {
		// get global template
		const template = $("template")[0];
		traverse(template, e => {
			// make sure that it is proper tag
			if (!e || !e.tagName || e.type != "tag") {
				return null;
			}
			// if this is an inline alias (started with a, for example a-header)
			// add this as inline

			let refName = e.attribs["ref"];
			if (refName) {
				const html = $(e).toString();
				const encoded = source.includes("${");

				templates[refName] = {
					html,
					element: e,
					encoded,
				}

			}
			return null;
		});
	}

	function assemble(literal: string, params: string[]) {
		return new Function(...params, "return `" + literal + "`;"); // TODO: Proper escaping
	}

	function modifyAllTags() {

		// get the template node
		const template = $("template")[0];

		// traverse all tags
		traverse(template, ref => {
			// make sure it is valid
			if (!ref || !ref.tagName || ref.type != "tag") {
				return null;
			}

			let isRef = ref.tagName == "ref";
			if (isRef) {
				const name = ref.attribs["name"];
				if (templates[name]) {
					if (templates[name].encoded) {

						const names = Object.keys(ref.attribs).filter(x => x != "name");
						const values = Object.entries(ref.attribs).filter(x => x[0] != "name").map(x => x[1]);
						// add content
						names.push("content");
						const content = $(ref).html() as string;
						values.push(content);
						const fun = assemble(templates[name].html, names);
						const filled = fun(...values);
						$(ref).replaceWith(filled);
					} else {
						$(ref).replaceWith(templates[name].html);
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

	for (let t of Object.values(templates).map(x => x.element)) {
		$(t).remove();
	}

	// now serialize body content to html
	let result = $("body").html() as string;
	result = source.replace(template, result);
	return result;
}

export {
	rewrite
}
