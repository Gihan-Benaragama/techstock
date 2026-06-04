import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://admin:1234@cluster0.ldaaoqa.mongodb.net/?appName=Cluster0";

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function run() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');
  const products = await Product.find({});
  console.log('Total products:', products.length);
  products.forEach(p => {
    console.log(`- ID: ${p.get('productId') || p.get('productID')}, Name: ${p.get('name')}, isAvailable: ${p.get('isAvailable')}, stock: ${p.get('stock')}`);
  });
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
