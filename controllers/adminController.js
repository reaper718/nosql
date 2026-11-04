const Product = require("../models/product");

const addProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, imageURL, price, description } = req.body;
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageURL: imageURL,
      userId: userId
    });

    await product.save();

    return res.status(201).json({
      success: true,
      product: product,
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      succes: false,
      error: error,
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageURL, price, description } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

      product.title = title;
      product.imageURL = imageURL;
      product.price = price;
      product.description = description;

      await product.save();

      return res.status(200).json({
        success: true,
        product: product,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product Deleted Successfully!!!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProduct,
  editProduct,
  deleteProduct,
};
