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
            res.status(500).json({
                success: false,
                error: err
            });
        });
};

const getCart = async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.productId');

        const products = user.cart.items;

        return res.status(200).json({
            success: true,
            products: products
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const postDeleteCartProduct = (req,res) => {
    const {prodId} = req.params;

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

const postOrder = async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.productId');

        if (user.cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const products = user.cart.items.map(i => {
            return {
                quantity: i.quantity,
                product: { ...i.productId.toObject() }
            };
        });

        const order = new Order({
            user: {
                name: user.name,
                userId: user._id
            },
            products: products
        });

        await order.save();

        await user.clearCart();

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order: order
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getOrders = async (req,res) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user.id });

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