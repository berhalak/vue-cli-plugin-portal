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
            <portal name="a">
                <content />
            </portal>
            <portal name="b" title="B title" />
            <portal name="c" />
        </div>
        <card portal="b">
            <h1>${title}</h1>
        </card>
        <card portal="a">
            <h1>${content}</h1>
        </card>
        <card portal="c">
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
            <card portal="a">
                <h1>
                    <content />
                </h1>
            </card>
            <card portal="b">
                <h1>B title</h1>
            </card>
            <card portal="c">
                <h1>C title</h1>
            </card>
        </div>
    </div>
</template>
<script>
</script>
```

