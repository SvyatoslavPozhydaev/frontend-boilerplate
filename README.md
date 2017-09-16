# GULP FRONTEND

## Install
```sh
$ mkdir <project name>
$ cd <project name>
$ git init
$ git remote add origin <url to git repo>
$ git pull origin master
$ git remote rm origin
$ git checkout -b develop
$ npm install
```

## Gulp commands
```sh
$ gulp dev           # for develop
$ gulp build         # for build 
$ gulp deploy:dev    # for deploy ( need set settings for deploying )
$ gulp deploy:prod   # for deploy ( need set settings for deploying )
```

## HTML Templates 

> Render [Nunjucks](http://mozilla.github.io/nunjucks/) templates

## Structure
```sh
│   .gitignore
│   gulpfile.js
│   package.json
│   README.md
|   webpack.config.js
└───resources                            # BASE PATH
    ├───assets                               # ASSETS
    │   ├───fonts                               # FONTS
    │   ├───images                              # IMAGES
    │   │   ├───favicon
    │   │   ├───share
    │   │   └───sprites
    │   ├───javascripts                         # JAVASCRIPTS
    │   │   │   Application.js                     # entry point js
    │   │   └───vendor                             # for vendors whithout support npm
    │   └───stylesheets                         # STYLESHEETS
    │       └───sass                              # sass
    │           │   application.sass                # entry point sass
    │           │   vendor.sass
    │           ├───blocks                          # BEM Blocks
    │           │       wrapper.sass
    │           ├───core                            # base settings
    │           │       core.sass
    │           │       _fonts.sass
    │           │       _typography.sass
    │           │       _variable.sass
    │           └───helpers
    │                   media.sass
    │                   mixins.sass
    ├───server
    │       .htaccess
    │       browserconfig.xml
    │       crossdomain.xml
    │       robots.txt
    └───views                                   # HTML Template
        ├───layouts
        │       layout.njk
        ├───pages
        │       404.njk
        │       index.njk
        └───shared
                _footer.njk
                _header.njk
```
