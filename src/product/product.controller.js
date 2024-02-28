'use strict'

import Product from './product.model.js';

export const test = (req, res) => {
    console.log('product test is running...');
    res.send({ message: `Product test is running...` });
}

//funcion para guardar un producto
export const save = async (req, res) => {
    try {
        let data = req.body;
        if(Object.entries(data).length === 0) return res.status(409).send({message:`Data is empty`});
        let product = new Product(data);
        await product.save();
        return res.send({ message: `Product saved successfully.` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error saving product.` });
    }
}

//funcion para obtener todos los productos
export const get = async (req, res) => {
    try {
        let products = await Product.find().populate('category', ['name']);
        return res.send({ products });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting products.` });
    }
}

//funcion para obtener un producto segun el id
export const getProduct = async (req, res) => {
    try {
        let { id } = req.params;
        let product = await Product.findOne({ _id: id }).populate('category', ['name', 'description']);
        if (!product) return res.status(404).send({ message: `Product not found.` })
        return res.send({ product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting product.` })
    }
}


//funcion para obtener un producto segun el nombre
export const searchProduct = async (req, res) => {
    try {
        let { name } = req.body;
        let product = await Product.findOne({ name }).populate('category');
        if (!product) return res.status(404).send({ message: `Product not found.` })
        return res.send({ product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting product.` })
    }
}

//funcion para llamar a los productos agotados (stock -> 0)
export const productOut = async (req, res) => {
    try {
        let product = await Product.find({ stock: 0 }).populate('category');
        return res.send({ product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting products out of stock.` })
    }
}

//funcion para modificar un producto
export const update = async (req, res) => {
    try {
        let data = req.body;
        let { id } = req.params;
        let updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('category');

        if (!updatedProduct) return res.status(400).send({ message: `Product not found and not updated.` });
        return res.send({ message: `Product updated succesfully`, updatedProduct })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error updating product.` })
    }
}

//funcion para eliminar productos
export const deleteP = async (req, res) => {
    try {
        let { id } = req.params;
        let deleteProduct = await Product.deleteOne({ _id: id });
        if (deleteProduct.deletedCount === 0) return res.status(404).send({ message: `Product not found and not deleted.` });
        return res.send({ message: `Deleted product successfully.` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error deleting product.` });
    }
}