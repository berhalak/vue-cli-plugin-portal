import { rewrite } from "./code";

const source = `
<template>
	<div>
		<span>
			<ref name="a" />
			<ref name="b" />		
		</span>
		<card ref="b"><h1>b</h1></card>
		<card ref="a"><h1>a</h1></card>
	</div>
</template>
<script>
</script>
`

const expected = `
<template>
	<div>
		<span>
			<card ref="a"><h1>a</h1></card>
			<card ref="b"><h1>b</h1></card>
		</span>
	</div>
</template>
<script>
</script>
`

function lin(text: string) {
	return text.trim().replace(/\s\s*/g, " ");
}


if (lin(expected) != lin(rewrite(source))) {
	console.log(rewrite(source));
	throw new Error("Test failed")
} else {
	console.log("Test passed")
}