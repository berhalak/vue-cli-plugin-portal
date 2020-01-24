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
	const refs: { [key: string]: CheerioElement } = {};

	// load vue template, wrap it in body, for use in html method at the end (html renders inner content)
	const $ = cheerio.load(`<body>${template}</body>`, { recognizeSelfClosing: true, xmlMode: true, decodeEntities: false });



	function findRefs() {
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
				refs[refName] = e;
			}
			return null;
		});
	}


	function modifyAllTags() {

		// get the template node
		const template = $("template")[0];

		// traverse all tags
		traverse(template, element => {
			// make sure it is valid
			if (!element || !element.tagName || element.type != "tag") {
				return null;
			}

			let isRef = element.tagName == "ref";
			if (isRef) {
				const name = element.attribs["name"];
				if (refs[name]) {
					$(element).replaceWith(refs[name]);
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
	let result = $("body").html() as string;
	result = source.replace(template, result);
	return result;
}

export {
	rewrite
}
