module.exports = {
  build: {
    default: {
      target: 'node',
      libraryTarget: 'commonjs2',
      useDecorator: true,
      entry: './src/server/main'
    },
    web: {
      entry: {
        demo1: './src/client/demo1/main',
        demo2: './src/client/demo2/main',
        demo3: './src/client/demo3/main'
      },
      extractCss: true,
      useDecorator: true,
      library: 'demo'
    }
  }
};