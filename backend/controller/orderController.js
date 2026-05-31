import Order from "../model/order.js";
import Product from "../model/product.js";

export default async function createOrder(req, res) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "You need to be logged in to place an order" });
    }

    const { items, total, firstName, lastName, email, streetnumbert, city, state, zipCode, country, note } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No items in order" });
    }

    // Generate order ID
    let orderId = "ORD00000001";
    try {
        const lastOrder = await Order.findOne().sort({ date: -1 });
        if (lastOrder) {
            const lastOrderNumber = parseInt(lastOrder.id.replace("ORD", ""), 10);
            const newOrderNumber = lastOrderNumber + 1;
            orderId = "ORD" + String(newOrderNumber).padStart(8, "0");
        }
    } catch (error) {
        return res.status(500).json({ message: "Error generating order ID" });
    }

    // Check stock and decrement
    try {
        for (const item of items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            product.stock -= item.qty;
            await product.save();
        }
    } catch (error) {
        return res.status(500).json({ message: "Error updating stock" });
    }

    // Build products array matching your order schema
    const products = items.map(item => ({
        productID: item.productId,
        name: item.name,
        price: item.price,
        labelPrice: item.price,   // use labelledPrice from product if you prefer
        quantity: item.qty,
    }));

    // Create and save order
    try {
        const newOrder = new Order({
            id: orderId,
            email: email || user.email,
            firstName: firstName || user.firstName || "",
            lastName: lastName || user.lastName || "",
            streetnumbert: streetnumbert || "",
            city: city || "",
            state: state || "",
            zipCode: zipCode || "",
            country: country || "",
            orderStatus: "Pending",
            note: note || "",
            totalPrice: total,
            products,
        });

        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully", orderId });

    } catch (error) {
        res.status(500).json({ message: "Error saving order", error: error.message });
    }
}

// Process a specific order
export async function processOrder(req, res) {
  const { orderId } = req.params;
  try {
    const updated = await Order.findOneAndUpdate(
      { id: orderId },
      { orderStatus: 'Processing' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order processing started', order: updated });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ message: 'Error processing order' });
  }
}
 
export async function getOrders(req, res) {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
}