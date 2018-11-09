# FRONTEND BOILERPLATE

## Install
```sh
$ git clone 
$ rm -rf .git
$ git init
$ npm install
```

## Develop
```sh
npm start       # for developing and   open  localhost:3000
npm run build   # for build. creating folder "build"
```

## HTML Templates 

> Render [Pug](https://pugjs.org/api/getting-started.html) templates

## Structure
```sh
│   .babelrc
│   .gitignore
│   package-lock.json
│   package.json
│   README.md
│   webpack.config.js
│
└────src
    │   index.js                                # entry point
    │
    ├───blocks                                  # blocks
    │   │   index.js
    │   │
    │   └───block-example
    │           index.sass
    │           square2.png
    │
    ├───common                                  # common libs (var, mixins, e.t.c)
    │   │   index.sass
    │   │   _mixins.sass
    │   │   _variables.sass
    │   │
    │   └───mixins
    │           _clearfix.sass
    │           _font-face.scss
    │           _media.sass
    │           _sticky-footer.sass
    │
    ├───fonts                                   # fonts
    │       index.sass
    │
    ├───images                                  # images
    │   │   .gitkeep
    │   │   square.png
    │   │   square3.png
    │   │
    │   ├───favicon
    │   │       apple-touch-icon.png
    │   │       favicon.ico
    │   │
    │   ├───share
    │   │       tile-wide.png
    │   │       tile.png
    │   │
    │   └───sprites
    │           .gitkeep
    │
    ├───layout                                  # base layout and blocks for layout
    │   │   app.pug
    │   │   index.js
    │   │
    │   ├───base
    │   │       index.sass
    │   │
    │   ├───footer
    │   │       footer.pug
    │   │       footer.sass
    │   │       index.js
    │   │
    │   ├───grid
    │   │       index.sass
    │   │
    │   └───header
    │           header.pug
    │           header.sass
    │           index.js
    │
    └───pages                                   # pages
        │   index.js
        │
        ├───404
        │       404.pug
        │       index.js
        │
        └───home
                index.js
                index.pug
                index.sass

```
