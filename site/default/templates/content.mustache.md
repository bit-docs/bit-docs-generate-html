@parent bit-docs-generate-html/theme
@module bit-docs-generate-html/site/default/templates/content.mustache content.mustache

@description The default content template.

@body

### Usage

The default `content.mustache` template contains the main HTML markup and
includes these other mustache files:

- `sidebar.mustache`
- `title.mustache`
- `description.mustache`
- `body.mustache`

Copy this file into your own project or theme to modify HTML markup, or
include other available templates. For instance, [bit-docs-js] provides the
`signature.mustache` template that can be included to show function
signatures in the generated output:

```
{{#unless hideBody}}
    {{#if signatures}}
        {{#each signatures}}
            {{> signature.mustache}}
        {{/each}}
    {{else}}
        {{#types}}
            {{> signature.mustache}}
        {{/types}}
    {{/if}}
    {{#if body}}
        {{> body.mustache}}
    {{/if}}
{{/unless}}
```
