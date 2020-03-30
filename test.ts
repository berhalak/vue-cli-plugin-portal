import { rewrite } from "./code";
import minify from "html-minifier"

const source = `
<template>
	<div>
		<span>
			<portal name="a">
				<content />
			</portal>
			<portal name="b" title="B title" />		
			<portal name="c"  />		
		</span>
		<card portal="b"><h1>\${title}</h1></card>
		<card portal="a"><h1>\${content}</h1></card>
		<card portal="c"><h1>C title</h1></card>
		<card portal="d">test</card>
	</div>
</template>
<script>
</script>
`

const expected = `
<template>
        <div>
			<span>
					<card portal="a">
						<h1>
							<content/>
						</h1>
					</card>
					<card portal="b">
						<h1>B title</h1>
					</card>
					<card portal="c">
						<h1>C title</h1>
					</card>
            </span>
            <card portal="d">test</card>
        </div>
</template>
<script>
</script>
`

function lin(text: string) {
	return minify.minify(text, {
		collapseWhitespace: true
	});
}


if (lin(expected) != lin(rewrite(source))) {
	console.log(lin(expected));
	console.log(lin(rewrite(source)));
	throw new Error("Test failed")
} else {
	console.log("Test passed")
}