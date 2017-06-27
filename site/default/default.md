@parent bit-docs-generate-html/theme
@page bit-docs-generate-html/theme/about About the Default Theme

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
[bit-docs-generate-html/theme/templates/content].

Other documentation that you might want to expose will come from the various
[docObjects] in the [docMap], and you will need to create your own mustache
templates as well as helpers to support that.

Most users will be happy using the default output for documentation, and will
primarily be editing the templates to add HTML markup for styling and
structure purposes, in tandem with [bit-docs-generate-html/theme/styles].

For any template files not copied over, the default template will be used.

### Styles

Styles are used to modify the visual representation of a generated website.

By default, `bit-docs` provides a very basic theme that consists of styles
that are meant to be copied over to your project and/or a custom theme,
and modified there as needed to suit your specific design needs.

Any of these files can be copied over and modified as needed. For any LESS
files not copied over, the default LESS file will be used.

Certain plugins provide their own LESS files for defining variables that
are to be used in styling whatever they add, and will include your
[variables.less] after their own so that you may override any LESS variables
that you might wish to. A good example of this is [bit-docs-prettify].
