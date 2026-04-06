const mongoose = require('mongoose');
require('dotenv').config({path: './Backend/.env'});

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Product = require('./Backend/src/models/Product.js');
    const prods = await Product.find({name: /iPhone 15 Pro Max/i});
    console.log(JSON.stringify(prods, null, 2));
    process.exit(0);
  })
  .catch(console.error);
