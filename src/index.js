window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js').default;

require('bootstrap');
import 'bootstrap/scss/bootstrap.scss'

import './fonts'
import './base'
import './grid'
import Blocks from './blocks'
import Views from './views'

class Application{
  constructor(){
    Blocks.init()
    Views.init()
  }
}

let app = null

$(function () {
  app = new Application();
})