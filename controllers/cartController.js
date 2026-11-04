const Users = require('../models/users');
const Product = require('../models/product');

const addProductToCart = (req, res) => {
    const { prodId }  = req.params;

    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            if (res.headersSent) return;

            res.status(200).json({
                success: true,
                result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Something went wrong" });
        });
};

const getCart = (req,res) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            console.log(user.cart.items);
            const products = user.cart.items;
            res.status(200).json({
                success: true,
                products: products
            })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err
            })
        })
    })
}

const postDeleteCartProduct = (req,res) => {
    const {prodId} = req.body;

    req.user
        .removeFromCart(prodId)
        .then(result => {
            console.log(result);
            res.status(200).json({
                success: true,
                message: "Item deleted successfully!!!"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err
            })
        })
}

const postOrder = (req,res) => {
    req.user
        .addOrder()
        .then(result => {
            res.status(200).json({
                success: true,
                message: "Order placed successfully"
            });

            res.redireec('/orders');
        })
        .catch(err => {
            console.log(err);
        })
}

const getOrders = (req,res) => {
    req.user
        .getOrder()
        .then(orders => {
            res.render('/orders', {
                path: "/orders",
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
}

module.exports = {
    addProductToCart,
    getCart,
    postDeleteCartProduct,
    postOrder,
    getOrders
}