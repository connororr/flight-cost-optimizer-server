const config = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
  ],
  env: {
    test: {
      presets: [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
          modules: 'commonjs'
        },
      ],
    },
  },
};

export default config;