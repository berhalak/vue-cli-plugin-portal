import { rewrite } from "./vue-alias";

const source = `
<template alias>
	<div>
		<define a-defined>
			<div class="test" />
		</define>
		<define a-slot>
			<div class="parent">
				<div class="child">
					<slot />
				</div>
			</div>
		</define>
		<define a-styled>
			<div style="color: red; padding: 3px" />
		</define>
		<template v-for="i in i">
		</template>
		<a-normal />
		<a-open :test="a" @click="x => do(x)"></a-open>
		<a-content>content<span></span></a-content>
		<a-nested><a-sub></a-sub></a-nested>
		<a-with-class class="test"></a-with-class>
		<a-defined />
		<a-defined></a-defined>
		<a-defined class='other' />
		<a-styled style="color: black" />
		<a-slot><a-defined /></a-slot>
	</div>
</template>
<script>
</script>
`

const expected = `
<template alias="">
	<div>
		
		
		
		<template v-for="i in i">
		</template>
		<div class="a-normal"/>
		<div :test="a" @click="x => do(x)" class="a-open"/>
		<div class="a-content">content<span/></div>
		<div class="a-nested"><div class="a-sub"/></div>
		<div class="test a-with-class"/>
		<div class="test a-defined"/>
		<div class="test a-defined"/>
		<div class="test other a-defined"/>
		<div style="color: red; padding: 3px;color: black" class="a-styled"/>
		<div class="parent a-slot"><div class="child">
					<div class="test a-defined"/>
				</div></div>
	</div>
</template>
<script>
</script>

`

if (expected.trim() != rewrite(source).trim()) {
	console.log(rewrite(source));
	throw new Error("Test failed")
} else {
	console.log("Test passed")
}