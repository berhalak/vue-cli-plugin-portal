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
	// at least one named portal
	if (!source.includes("<portal")) {
		return source;
	}

	let templateMatch = source.match(/<template>.*<\/template>/s);
	let template = '';
	if (templateMatch && templateMatch.length) {
		template = templateMatch[0] as string;
	} else {
		return source;
	}




	// define aliases dictionary	
	const templates: {
		[key: string]: {
			html: string,
			element: CheerioElement,
			encoded: boolean,
			used: boolean
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

			let refName = e.attribs["portal"];
			if (refName && e.tagName != "portal") {
				const html = $(e).toString();
				const encoded = source.includes("${");

				templates[refName] = {
					html,
					element: e,
					encoded,
					used: false,
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

		let mutated = false;

		// traverse all tags
		traverse(template, portal => {
			// make sure it is valid
			if (!portal || !portal.tagName || portal.type != "tag") {
				return null;
			}

			let isRef = portal.tagName == "portal";
			if (isRef) {
				const name = portal.attribs["name"];
				if (templates[name]) {
					templates[name].used = true;
					mutated = true;
					if (templates[name].encoded) {

						const names = Object.keys(portal.attribs).filter(x => x != "name" && x != 'portal');
						const values = Object.entries(portal.attribs).filter(x => x[0] != "name" && x[0] != "portal").map(x => x[1]);
						// add content
						names.push("content");
						const content = $(portal).html() as string;
						values.push(content);
						const fun = assemble(templates[name].html, names);
						const filled = fun(...values);
						const created = $(portal).replaceWith(filled);
						if (portal.attribs["portal"]) {
							created.attr("portal", portal.attribs["portal"])
						}
					} else {
						const created = $(portal).replaceWith(templates[name].html);
						if (portal.attribs["portal"]) {
							created.attr("portal", portal.attribs["portal"])
						}
					}
				}
			}

			return null;
		});

		return mutated;
	}


	// first read all aliases
	findTemplates();

	// then go through every tag and modify this according to the definition
	if (!modifyAllTags()) {
		return source;
	}

	for (let t of Object.values(templates)) {
		if (t.used) {
			$(t.element).remove();
		}
	}

	// now serialize body content to html
	let result = $("body").html() as string;
	result = source.replace(template, result);
	return result;
}

export {
	rewrite
}
