# vue-cli-plugin-portal
Simple portal vue cli plugin, done by rewriting vue files

Installation:
vue add vue-cli-plugin-portal

Or through vue ui, search for vue-cli-plugin-portal

Sample (also see test.ts)

Transforms vue template from alias form (you can use interpolation of args and content)

``` html
<template>
    <div>
        <div>
            <ref name="a">
                <content />
            </ref>
            <ref name="b" title="B title" />
            <ref name="c" />
        </div>
        <card ref="b">
            <h1>${title}</h1>
        </card>
        <card ref="a">
            <h1>${content}</h1>
        </card>
        <card ref="c">
            <h1>C title</h1>
        </card>
    </div>
</template>
<script>
</script>
```

To:

``` html
<template>
    <div>
        <div>
            <card ref="a">
                <h1>
                    <content />
                </h1>
            </card>
            <card ref="b">
                <h1>B title</h1>
            </card>
            <card ref="c">
                <h1>C title</h1>
            </card>
        </div>
    </div>
</template>
<script>
</script>
```

