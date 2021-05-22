const pug = require('pug');

module.exports = ({ basedir, locals }) => {
  const files = {};
  const regexpSrc = /module\.exports = (.+)?"(.+)?";/;
  return async (content, loaderContext) => {
    let result;
    try {
      const render = pug.compile(content, {
        doctype: 'html',
        basedir,
        pretty: '    ',
        inlineRuntimeFunctions: false,
      });
      render.dependencies.forEach(loaderContext.addDependency);
      result = render({
        require: (pathRequire) => {
          if (!files[pathRequire]) {
            files[pathRequire] = new Promise((resolve, reject) => {
              loaderContext.resolve(
                basedir,
                pathRequire,
                (err, pathResolve) => {
                  if (err) {
                    reject(err);
                  } else {
                    loaderContext.loadModule(
                      pathResolve,
                      (err2, source, sourceMap, module) => {
                        if (err2) {
                          reject(err2);
                        } else {
                          const match = regexpSrc.exec(source);
                          if (match) {
                            const [_, _public, src] = match;
                            // eslint-disable-next-line no-underscore-dangle
                            const prefix = _public ? loaderContext._compiler.options.output.publicPath : '';
                            resolve(prefix + src);
                          } else {
                            reject(new Error('not found src'));
                          }
                        }
                      },
                    );
                  }
                },
              );
            });
          }
          return pathRequire;
        },
        ...locals,
      });
      const fileResources = await Promise.all(
        Object
          .entries(files)
          .map(([key, promise]) => promise.then((value) => [key, value])),
      );
      fileResources.forEach(([key, value]) => {
        result = result.replace(new RegExp(key, 'ig'), value);
      });
    } catch (error) {
      loaderContext.emitError(error);
      return content;
    }
    return result;
  };
};
