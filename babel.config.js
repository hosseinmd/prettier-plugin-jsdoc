/** @type {import('@babel/core').TransformOptions} */
module.exports = {
    env: {
      test: {
        targets: { node: 'current' },
        presets: [['@babel/preset-env', { modules: 'commonjs' }]],
      },
    }}