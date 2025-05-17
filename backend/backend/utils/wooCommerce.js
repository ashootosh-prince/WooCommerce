if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const WooCommerce = new WooCommerceRestApi({
  url:process.env.WooCommerceUrl,
  consumerKey: process.env.WooCommerce_ConsumerKey,
  consumerSecret: process.env.WooCommerce_ConsumerSecret,
  version: 'wc/v3',
  queryStringAuth: true,
});

module.exports = WooCommerce;
