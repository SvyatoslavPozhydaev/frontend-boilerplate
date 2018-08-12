window.$ = window.jQuery = require('jquery');

// Uncomment for use BOOTSTAP4
// window.Popper = require('popper.js').default;
// require('bootstrap');
// import 'bootstrap/scss/bootstrap.scss'

import './fonts'
import initLayout from './layout'
import initBlocks from './blocks'
import initPages from './pages'

class Application{
  constructor(){
    initLayout()
    initBlocks()
    initPages()
  }
}

let app = null

$(function () {
  app = new Application();
})