import express from "express";
import mongoose from "mongoose";
import studentRouter from "./routers/studentRouter.js";
import userRouter from "./routers/userRouter.js";
import authenticateUser from "./middleware/authentication.js";
import productRouter from "./routers/productRouter.js";

const app = express();
function go() {
    console.log("Started..")
}


const mongoURI = "mongodb+srv://admin:1234@cluster0.ldaaoqa.mongodb.net/test"



mongoose.connect(mongoURI)

.then(() => {
    console.log("Connected to MongoDB");
    go();
})
.catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});

app.use(express.json());
app.use(authenticateUser);


       

app.use('/students', studentRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);

      
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});



/*{
  "email": "admin@gmail.com",
  "password": "admin123"
} */



/*{
  "productId": "PRD001",
  "name": "ASUS ROG Strix G16",
  "price": 1899.99,
  "labelledPrice": 1899.99,
  "stock": 15
}*/