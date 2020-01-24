# vue-cli-plugin-portal
Simple portal vue cli plugin, done by rewriting vue files


Installation:
vue add vue-cli-plugin-portal

Or through vue ui, search for vue-cli-plugin-portal

Sample (also see test.ts)

Transforms vue template from alias form:
```html
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
```
To:
```html
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
```

