// https://github.com/babel/babel/issues/8672
// https://babeljs.io/docs/en/config-files#6x-vs-7x-babelrc-loading

const babelConfig = require('./.babelrc.json');

module.exports = function (api) {
  api.cache(true);
  return babelConfig;
};
