if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cors = require('cors');

app.use(cors());
app.use(express.json());
const port = 8080;
const dbUrl = 'mongodb://localhost:27017/WooCommerce'

main().then(() => {
    console.log("connection to DB");
})
.catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


app.get('/', (req, res) => {
    res.send("Hello, I am root");
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})
