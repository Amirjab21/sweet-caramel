const { join } = require('path');

require('../utils/src/envLoader');

const workspace = join(__dirname, '..');

module.exports = {
  target: 'serverless',
  env: {
    RPC_URL: process.env.RPC_URL,
    CHAIN_ID: process.env.CHAIN_ID,
    ADDR_HYSI: process.env.ADDR_HYSI,
    ADDR_SET_SET_TOKEN_CREATOR: process.env.ADDR_SET_SET_TOKEN_CREATOR,
    ADDR_SET_BASIC_ISSUANCE_MODULE: process.env.ADDR_SET_BASIC_ISSUANCE_MODULE,
    ADDR_SET_STREAMING_FEE_MODULE: process.env.ADDR_SET_STREAMING_FEE_MODULE,
    ADDR_SET_STREAMING_FEE_MODULE_FEE_RECIPIENT:
      process.env.ADDR_SET_STREAMING_FEE_MODULE_FEE_RECIPIENT,
    ADDR_YEARN_CRVDUSD: process.env.ADDR_YEARN_CRVDUSD,
    ADDR_CURVE_CRVDUSD: process.env.ADDR_CURVE_CRVDUSD,
    ADDR_YEARN_CRVFRAX: process.env.ADDR_YEARN_CRVFRAX,
    ADDR_CURVE_CRVFRAX: process.env.ADDR_CURVE_CRVFRAX,
    ADDR_YEARN_CRVUSDN: process.env.ADDR_YEARN_CRVUSDN,
    ADDR_CURVE_CRVUSDN: process.env.ADDR_CURVE_CRVUSDN,
    ADDR_YEARN_CRVUST: process.env.ADDR_YEARN_CRVUST,
    ADDR_CURVE_CRVUST: process.env.ADDR_CURVE_CRVUST,
  },
  poweredByHeader: false,
  webpack: (config, options) => {
    /** Allows import modules from packages in workspace. */
    config.module = {
      ...config.module,
      rules: [
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: { svgo: false },
            },
            'file-loader',
          ],
        },
        ...config.module.rules,
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [workspace],
          exclude: /node_modules/,
          use: options.defaultLoaders.babel,
        },
      ],
    };
    return config;
  },
};
