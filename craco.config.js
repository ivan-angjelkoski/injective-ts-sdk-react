const webpack = require("webpack");

module.exports = {
  babel: {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: [],
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify"),
          buffer: require.resolve("buffer/"),
          path: require.resolve("path-browserify"),
          util: require.resolve("util/"),
          assert: require.resolve("assert/"),
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          url: require.resolve("url/"),
          zlib: require.resolve("browserify-zlib"),
          fs: false,
          net: false,
        },
      },
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
    },
    optimization: {
      minimize: false,
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      ],
    },
  },
};
