# FRONTEND BOILERPLATE

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

## Develop
```sh
npm start       # for developing and   open  localhost:3000
npm run build   # for build. creating folder "build"
```

## HTML Templates 

> Render [Nunjucks](http://mozilla.github.io/nunjucks/) templates

## Structure
```sh
|   .babelrc
|   .gitignore
|   package-lock.json
|   package.json
|   README.md
|   webpack.config.js
|                   
\---src
    |   index.js
    |   
    +---base
    |       index.sass
    |       
    +---blocks
    |   |   index.js
    |   |   
    |   \---block-example
    |           index.sass
    |           square2.png
    |           
    +---fonts
    |       index.sass
    |       
    +---grid
    |       index.sass
    |       
    +---images
    |   |   .gitkeep
    |   |   square.png
    |   |   square3.png
    |   |   
    |   +---favicon
    |   |       apple-touch-icon.png
    |   |       favicon.ico
    |   |       
    |   +---share
    |   |       tile-wide.png
    |   |       tile.png
    |   |       
    |   \---sprites
    |           .gitkeep
    |           
    +---mixins
    |       index.sass
    |       _clearfix.sass
    |       _font-face.scss
    |       _media.sass
    |       _sticky-footer.sass
    |       
    +---variables
    |       index.sass
    |       
    \---views
        |   index.js
        |   
        +---layouts
        |       layout.njk
        |       
        +---pages
        |   |   index.js
        |   |   
        |   +---404
        |   |       404.njk
        |   |       index.js
        |   |       
        |   \---home
        |           index.js
        |           index.njk
        |           
        \---shared
                _footer.njk
                _header.njk

```
