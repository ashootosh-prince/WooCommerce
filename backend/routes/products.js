const express = require('express');
const auth = require('../middleware/auth');
const {createProduct, getProducts, updateProduct, deleteProduct} = require('../controllers/productController');

const router = express.Router();

router.post('/', auth, createProduct);
router.get('/', auth, getProducts);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);


module.exports = router;