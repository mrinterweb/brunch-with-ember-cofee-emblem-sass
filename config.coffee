sysPath = require 'path'

exports.config =
  # See http://brunch.io/#documentation for documentation.
  modules:
    definition: false
    wrapper: false
  files:
    javascripts:
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
        'test/javascripts/test-vendor.js': /^test(\/|\\)(?=vendor)/

      order:
        before: [
          'vendor/scripts/jquery-1.10.2.js'
          'vendor/scripts/handlebars-1.1.2.js'
          'vendor/scripts/ember-1.2.0.js'
          'vendor/scripts/emblem.js'
          ]

    stylesheets:
      joinTo:
        'stylesheets/app.css': /^(app|vendor)/
      order:
        before: ['vendor/styles/normalize.css']

    templates:
      wrapper: false
      precompile: true
      root: 'templates'
      joinTo: 'javascripts/app.js' : /^app/

      modules:
        addSourceURLs: true

      paths:
        jquery: 'vendor/scripts/jquery-1.9.1.js'
        handlebars: 'vendor/scripts/handlebars-1.0.0.js'
        ember: 'vendor/scripts/ember-1.0.0.js'
        emblem: 'vendor/scripts/emblem.js'

  # allow _ prefixed templates so partials work
  conventions:
    ignored: (path) ->
      startsWith = (string, substring) ->
        string.indexOf(substring, 0) is 0
      sep = sysPath.sep
      if path.indexOf("app#{sep}templates#{sep}") is 0
        false
      else
        startsWith sysPath.basename(path), '_'
