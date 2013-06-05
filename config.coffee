exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  files:
    javascripts:
      defaultExtension: 'js'
      joinTo:
        'main.js': /^app/
        'vendor/spine.js': /^vendor\/scripts\/spine/
        'vendor/common.js': /^vendor\/scripts\/common/
      order:
        before: [
          'vendor/scripts/common/jquery-1.8.0.js',
          'vendor/scripts/common/bootstrap.js',
          'vendor/scripts/spine/spine.js',
          'vendor/scripts/spine/lib/ajax.js',
          'vendor/scripts/spine/lib/local.js',
          'vendor/scripts/spine/lib/manager.js',
          'vendor/scripts/spine/lib/route.js',
          'vendor/scripts/spine/lib/view.js'
        ]
        after: [
          'vendor/scripts/common/micro/animation.js',
          'vendor/scripts/common/micro/micro.js',
          'vendor/scripts/common/micro/list.js',
          'vendor/scripts/common/micro/grid.js',
          'vendor/scripts/common/micro/loadingmask.js',
          'vendor/scripts/common/micro/navigationview.js',
          'vendor/scripts/common/micro/accordion.js',
          'vendor/scripts/common/micro/tabgroup.js',
          'vendor/scripts/common/micro/htmlmarkup.js',
          'vendor/scripts/common/micro/carousel.js',
          'vendor/scripts/common/micro/hbox.js',
          'vendor/scripts/common/micro/vbox.js',
        ]
        
    stylesheets:
      defaultExtension: 'scss'
      joinTo: 'css/app.css'
      order:
        before:[
           'vendor/styles/core.scss',
          'vendor/styles/bootstrap.css',
          'vendor/styles/transition.css'
          
        ]
