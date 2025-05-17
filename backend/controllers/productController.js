const Product = require('../models/Product');
const WooCommerce = require('../utils/wooCommerce');
const mongoose = require("mongoose");


//Create Products route
const createProduct = async (req, res) => {
    try {
        const {name, description,price,imageUrl } = req.body;
        const sellerId = req.user.id;

        const product = await Product.create({
            user: sellerId,
            name,
            description,
            price,
            imageUrl,
           
        });

        try {
            const response = await WooCommerce.post('products', {
                name,
                type: 'simple',
                regular_price: price.toString(),
                description,
                images: imageUrl ? [{ src: imageUrl }] : [],
            });

            product.status = 'Synced to WooCommerce';
            product.WooCommerceId = response.data.id;
            await product.save();
        } catch (err) {
            console.error('WooCommerce sync error:', err.message);
            product.status = 'Sync Failed';
            await product.save();
        }
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({message:'Server error', error: err.message});

    }
};

 // Get Products route
const getProducts = async (req, res) => {
  const sellerId = req.user.id;  // <--- use `id`, not `userId`
  if (!sellerId) {
    return res.status(400).json({ message: 'User ID missing in token' });
  }

  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Update Product route
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user.id;
  console.log('Updating product ID:', productId, 'by user:', sellerId);

  try {
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('Invalid productId:', productId);
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      console.error('Invalid sellerId:', sellerId);
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const product = await Product.findById(productId);
    console.log('Product by ID:', product);

    if (!product) {
      console.error('Product not found for update');
      return res.status(404).json({ message: 'Product not found' });
    }
     if (product.user.toString() !== sellerId) {
      console.warn('Unauthorized update attempt by:', sellerId);
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, description, price, imageUrl } = req.body;
    console.log('Update data:', req.body);

    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;

    await product.save();
    console.log('Product saved successfully');

    // WooCommerce sync if needed
    if (product.wooCommerceId) {
      try {
        await WooCommerce.put(`products/${product.wooCommerceId}`, {
          name: product.name,
          description: product.description,
          regular_price: product.price.toString(),
          images: [{ src: product.imageUrl }],
        });
        product.status = 'Synced to WooCommerce';
        await product.save();
        console.log('WooCommerce sync success');
      } catch (err) {
        console.error('WooCommerce sync failed:', err.message);
        product.status = 'Sync Failed';
        await product.save();
      }
    }

    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err.stack || err);
    res.status(500).json({ message: 'Server error' });
  }
};




// delete product route

const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user.id;

  try {
    const product = await Product.findById(productId);
    console.log('Product by ID:', product);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    } 
    if (product.user.toString() !== sellerId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
    }
  

    if (product.wooCommerceId) {
      try {
        await WooCommerce.delete(`products/${product.wooCommerceId}`, {
          force: true
        });
      } catch (err) {
        console.warn('Failed to delete from WooCommerce (continuing):', err.message);
      }
    }

    await Product.deleteOne({ _id: productId });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  } 
};
    

module.exports = {createProduct, getProducts, updateProduct, deleteProduct};