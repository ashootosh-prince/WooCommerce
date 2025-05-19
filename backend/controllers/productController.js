const Product = require('../models/Product');
const WooCommerce = require('../utils/wooCommerce');
const mongoose = require("mongoose");
const { URL } = require('url');


// Utility to check if a given string is a valid HTTP/HTTPS URL
const isValidImageUrl = (url) => {
  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(parsed.pathname) && !parsed.hostname.includes('google.com');
  } catch {
    return false;
  }
};

// Create  products route

const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const sellerId = req.user.id;

    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

    // Create product locally in MongoDB
    const newProduct = await Product.create({
      user: sellerId,
      name,
      description,
      price,
      imageUrl,
    });

    // Prepare payload for WooCommerce
    const wooPayload = {
      name,
      type: 'simple',
      regular_price: parseFloat(price).toFixed(2),
      description,
    };

    // Include image if the URL is valid
    if (imageUrl && isValidImageUrl(imageUrl)) {
      wooPayload.images = [{ src: imageUrl }];
    }

    // Try syncing to WooCommerce
    try {
      const wooResponse = await WooCommerce.post('products', wooPayload);
      newProduct.status = 'Synced to WooCommerce';
      newProduct.wooCommerceId = wooResponse.data.id;
      await newProduct.save();
    } catch (wooErr) {
      console.error('WooCommerce sync failed:', wooErr.response?.data || wooErr.message);
      newProduct.status = 'Sync Failed';
      await newProduct.save();
    }

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Product creation error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


 // Get Products route
const getProducts = async (req, res) => {
  const sellerId = req.user.id;  
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

    // WooCommerce sync
    if (product.wooCommerceId) {
      try {
        // Validate image URL
        const isValidUrl = (url) => {
          try {
            const u = new URL(url);
            return u.protocol === "http:" || u.protocol === "https:";
          } catch {
            return false;
          }
        };

        let wooUpdatePayload = {
          name: product.name,
          description: product.description,
          regular_price: product.price.toString(),
        };

        if (product.imageUrl && isValidUrl(product.imageUrl)) {
          wooUpdatePayload.images = [{ src: product.imageUrl }];
        }

        console.log('WooCommerce update payload:', wooUpdatePayload);

        await WooCommerce.put(`products/${product.wooCommerceId}`, wooUpdatePayload);

        product.status = 'Synced to WooCommerce';
        await product.save();
        console.log('WooCommerce sync success');
      } catch (err) {
        console.error('WooCommerce sync failed:', err.response?.data || err.message);
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