@parent bit-docs-generate-html
@page bit-docs-generate-html/about-defaults About the defaults

@description Templates and styles come with the default theme.

@body

### Templates

Templates are used by `bit-docs` to generate the output of a website.

By default, `bit-docs` provides a very basic theme that consists of template
files that are meant to be copied over to your project and/or a custom theme,
and modified there as needed to suite your specific layout needs.

The default templates do not make any assumptions about the type of website
you are trying to generate. If you are generating documentation, you will
probably want to add things like function signatures to the output of the
generated website. That can be done by adding the `signature.mustache` to
[bit-docs-generate-html/site/default/templates/content.mustache].

Other documentation that you might want to expose will come from the various
[bit-docs/types/docObject]s in the [bit-docs/types/docMap], and you will need
to create your own mustache templates as well as helpers to support that.

Most users will be happy using the default output for documentation, and will
primarily be editing the templates to add HTML markup for styling and
structure purposes, in tandem with
[bit-docs-generate-html/site/default/static/styles/styles.less].

For any template files not copied over, the default template will be used.

### Static

Styles are used to modify the visual representation of a generated website.

By default, `bit-docs` provides a very basic theme that consists of styles
that are meant to be copied over to your project and/or a custom theme,
and modified there as needed to suit your specific design needs.

Any of these files can be copied over and modified as needed. For any less
files not copied over, the default less file will be used.

Certain plugins provide their own less files for defining variables that
are to be used in styling whatever they add, and will include your
[bit-docs-generate-html/site/default/static/styles/variables.less] after
their own so that you may override any less variables that you might wish to.
A good example of this is [bit-docs-prettify].
