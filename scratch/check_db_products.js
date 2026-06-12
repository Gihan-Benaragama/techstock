import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://admin:1234@cluster0.ldaaoqa.mongodb.net/?appName=Cluster0";

const productSchema = new mongoose.Schema({
    productId: String,
    productID: String,
    name: String,
    price: Number,
    images: [String],
    category: String,
});

const Product = mongoose.model("Product", productSchema);

async function run() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to DB successfully.");
        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);
        products.forEach(p => {
            console.log(`Name: ${p.name}`);
            console.log(`productId: ${p.productId} / ${p.productID}`);
            console.log(`images:`, p.images);
            console.log('---');
        });
    } catch (err) {
        console.error("Error connecting or querying:", err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
