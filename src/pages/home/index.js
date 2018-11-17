import Vue from 'vue';
import AppVue from './App.vue';
import AppReact from './App.jsx';

import './index.sass';
import './index.pug';

import './test-scss.scss';

import tmpPug from './examplate-inline.inline.pug';

export default () => {
  console.log(tmpPug());

  new Vue({
    el: '#test-vue',
    render: createElem => createElem(AppVue),
  });

  AppReact();
};
