const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: { type: String, default: "Created Locally" },
  wooCommerceId: { type: Number, default: null },
});

module.exports = mongoose.model("Product", productSchema);
