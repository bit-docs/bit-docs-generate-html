@parent bit-docs-generate-html/theme/templates
@page bit-docs-generate-html/theme/templates/content content

@description The default content template.

@body

The `content.mustache` template includes other mustache files, by default:

- `sidebar.mustache`
- `title.mustache`
- `description.mustache`
- `body.mustache`

Additionally, the template includes the main HTML markup.

Copy this file into your own project or theme to modify HTML markup, or include
other available templates.

For instance, [bit-docs-js] provides the `signature.mustache` template that can
be included to show function signatures in the generated output:

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
