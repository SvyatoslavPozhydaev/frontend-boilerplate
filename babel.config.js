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
          targets: {
            browsers: [
              'last 15 versions',
              'ie >= 9',
              'safari >= 8',
              'ios >= 8',
            ],
          },
          modules: false,
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
