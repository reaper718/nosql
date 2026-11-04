const Product = require('../models/product');
const Order = require('../models/order');

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
        .populate('cart.items.prodcuId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, product: {...i.productId_doc}};
            });

            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user.id
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            console.log(result);
            req.user.clearCart();
        })
        .then(() => {
                res.status(200).json({
                success: true,
                message: "order placed successfully"
            })
        })
        .catch(err => console.log(err));
}

const getOrders = async (req,res) => {
    try {
        const orders = Order.find({ 'user.userId': req.user.id });

        res.status(200).json({
            success: true,
            orders: orders
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

module.exports = {
    addProductToCart,
    getCart,
    postDeleteCartProduct,
    postOrder,
    getOrders
}