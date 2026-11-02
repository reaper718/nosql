const express = require('express');
const {mongoConnect} = require('./utils/database');

const app = express();
app.use(express.json());

const productRouter = require('./routers/productRouter');
const userRouter = require('./routers/userRouter');
const cartRouter = require('./routers/cartRouter');

app.use('/product', productRouter);
app.use('/user', userRouter);
app.use('/cart', cartRouter);   

mongoConnect(() => {
    app.listen(3000, () => {
        console.log("Server is running!!!");
    })
})

