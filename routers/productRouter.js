import express from "express";
import { createProduct, getAllProducts, deleteProduct , updateProduct , getProductById} from '../controller/productController.js';

const productRouter = express.Router();

productRouter.get('/', getAllProducts);
productRouter.post('/', createProduct);
productRouter.get("/search" , ()=>{
    console.log("Search API")
})
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
productRouter.get("/:productId", getProductById);

export default productRouter;