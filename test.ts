import { rewrite } from "./code";

const source = `
<template>
	<div>
		<span>
			<ref name="a">
				<content />
			</ref>
			<ref name="b" title="B title" />		
			<ref name="c"  />		
		</span>
		<card ref="b"><h1>\${title}</h1></card>
		<card ref="a"><h1>\${content}</h1></card>
		<card ref="c"><h1>C title</h1></card>
	</div>
</template>
<script>
</script>
`

const expected = `
<template>
        <div>
			<span>
					<card ref="a">
						<h1>
							<content/>
						</h1>
					</card>
					<card ref="b">
						<h1>B title</h1>
					</card>
					<card ref="c">
						<h1>C title</h1>
					</card>
			</span>
        </div>
</template>
<script>
</script>
`

function lin(text: string) {
	return text.trim().replace(/\s\s*/g, " ").trim();
}


if (lin(expected) != lin(rewrite(source))) {
	console.log(lin(expected));
	console.log(lin(rewrite(source)));
	throw new Error("Test failed")
} else {
	console.log("Test passed")
}