
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const WooCommerce = new WooCommerceRestApi({
  url:'https://ecom-softly-hard-blaze.wpcomstaging.com',
  consumerKey: 'ck_45f56aef41d13094a491ac745243e9a11080476b',
  consumerSecret:'cs_1ff8f0783046758ae7c675a0120e2fad1ff3c189',
  version: 'wc/v3',
  queryStringAuth: true,
});

module.exports = WooCommerce;
