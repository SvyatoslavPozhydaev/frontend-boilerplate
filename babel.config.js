// https://github.com/babel/babel/issues/8672
// https://babeljs.io/docs/en/config-files#6x-vs-7x-babelrc-loading

module.exports = function (api) {
  api.cache(true);
  return {
    comments: false,
    presets: [
      [
        '@babel/env',
        {
          modules: false,
          corejs: 3,
          useBuiltIns: 'usage',
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: false,
        },
      ],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-object-rest-spread',
      '@babel/plugin-syntax-dynamic-import',
    ],
  };
};
