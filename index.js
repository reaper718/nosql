const express = require('express');
const {mongoConnect} = require('./utils/database');

const app = express();
app.use(express.json());

const productRouter = require('./routers/productRouter');
const userRouter = require('./routers/userRouter');

app.use('/product', productRouter);
app.use('/user', userRouter);

mongoConnect(() => {
    app.listen(3000, () => {
        console.log("Server is running!!!");
    })
})

