const mongodb = require('mongodb');
const Product = require('../models/product');

const addProduct = (req,res) => {
    const { title, imageURL, price, description } = req.body;

    const product = new Product(title, price, description, imageURL)
    
    product.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        })
}

const getAllProducts = (req,res) => {
    Product.fetchAll()
        .then(products => {
            console.log(products);
        })
        .catch(err => {
            console.log(err);  
        })
}

const getProduct = (req,res) => {
    const id = req.params.id;

    Product.findById(id)
        .then(product => {
            console.log(product);
        })
        .catch(err => {
            console.log(err);
        })
}

const editProduct = (req,res) => {
     const {prodId ,title, imageURL, price, description } = req.body;

     const product = new Product(title, price, description, imageURL, new mongodb.ObjectId(prodId));

     product.save()
        .then(product => {
            console.log(product);
        })
        .catch(err => {
            console.log(err);
        })

}

const deleteProduct = (req,res) => {
    const prodId = req.params.id;

    Product.delete(prodId)
        .then(() => {
            console.log("Product deleted");
        })
        .catch(err => {
            console.log(err);
        })
}

module.exports = {
    addProduct,
    getAllProducts,
    getProduct,
    editProduct,
    deleteProduct
}