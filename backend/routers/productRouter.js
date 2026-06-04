import express from "express";
import { createProduct, getAllProducts, deleteProduct , updateProduct , getProductById} from '../controller/productController.js';
import authenticateUser, { optionalAuthenticateUser } from "../middleware/authentication.js";

const productRouter = express.Router();

productRouter.get('/', optionalAuthenticateUser, getAllProducts);
productRouter.post('/', authenticateUser, createProduct);
productRouter.get('/search', optionalAuthenticateUser, getAllProducts); // Support search via query params
productRouter.delete("/:productId", authenticateUser, deleteProduct);
productRouter.put("/:productId", authenticateUser, updateProduct);
productRouter.get("/:productId", optionalAuthenticateUser, getProductById);

export default productRouter;