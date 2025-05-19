if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

console.log("Initializing WooCommerce client with hardcoded config...");

const WooCommerce = new WooCommerceRestApi({
  url:'https://ecom-softly-hard-blaze.wpcomstaging.com',
  consumerKey: process.env.WooCommerce_ConsumerKey,
  consumerSecret: process.env.WooCommerce_ConsumerSecret,
  version: 'wc/v3',
  queryStringAuth: true,
});
console.log('WooCommerce client created successfully');
module.exports = WooCommerce;
