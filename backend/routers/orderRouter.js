import express from "express";
import createOrder, { getOrders, processOrder } from "../controller/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.post("/:orderId/process", processOrder);

export default router;