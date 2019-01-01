import 'core-js/es6/promise';

// for hot reload in ie10 ie11
import 'core-js/es6/symbol';
import 'core-js/es6/array';
import 'url-polyfill';
// ===========================

import $ from 'jquery';

// Uncomment for use BOOTSTAP4
// window.Popper = require('popper.js').default;
// require('bootstrap');
// import 'bootstrap/scss/bootstrap.scss';

import './fonts';
import initLayout from './layout';
import initBlocks from './blocks';
import initPages from './pages';

$(() => {
  initLayout();
  initBlocks();
  initPages();
});
