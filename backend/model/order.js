import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    streetnumbert: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    orderStatus: { type: String, required: true ,default: "Pending"},
    note: { type: String },
    totalPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now },

    products: [
    {
      productID: { type:String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      labelPrice: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
 ]
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;