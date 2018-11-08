import $ from 'jquery';

// Uncomment for use BOOTSTAP4
// window.Popper = require('popper.js').default;
// require('bootstrap');
// import 'bootstrap/scss/bootstrap.scss';

import './fonts';
import initLayout from './layout';
import initBlocks from './blocks';
import initPages from './pages';

// import Vue from 'vue';
// import App from './App.vue';

$(() => {
  initLayout();
  initBlocks();
  initPages();

  // new Vue({
  //   el: '#app',
  //   render: (createElem) => createElem(App),
  // });
});
