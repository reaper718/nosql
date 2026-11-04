const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

const adminRouter = require('./routers/adminRouter');
const userRouter = require('./routers/userRouter');
const cartRouter = require('./routers/cartRouter');

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"))
})

app.use(express.static(path.join(__dirname, "./public")));

app.use('/product', adminRouter);
app.use('/user', userRouter);
app.use('/cart', cartRouter);   

mongoose.connect('mongodb+srv://rudra:gPRJItKbI1MsM12i@cluster0.vxqdpak.mongodb.net/shop')
        .then(res => {
            console.log("connection to database made");
            app.listen(3000, () => {
                console.log("server is running");
            })
        })
        .catch(err => console.log(err));

