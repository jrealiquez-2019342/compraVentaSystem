'use strict'

import Category from './category.model.js';
import Product from './../product/product.model.js';

export const test = (req, res) => {
    console.log('category test is running...');
    res.send({ message: `Category test is running...` });
}

//CREATE
export const save = async (req, res) => {
    try {
        let data = req.body;

        //verificar si tiene un isDefault
        if (data.isDefault) {
            //validar que no exista un isDefault con valor true
            let exist = await Category.findOne({ isDefault: true });
            if (exist && exist.isDefault === true) {
                return res.status(400).send({ message: `Error adding | Category default exist.` });
            }
        }

        let category = new Category(data);
        await category.save();
        return res.send({ message: `Category saved successfully.` });
    } catch (err) {

        if (err.code === 11000 && err.keyPattern && err.keyPattern.name === 1)
            return res.status(400).send({ message: `Error adding | Category with this name already exists.` });

        console.error(err);
        return res.status(500).send({ message: `Error saving category.` });
    }
}

//READ

export const get = async (req, res) => {
    try {
        let categories = await Category.find();
        return res.send({ categories });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error getting categories.` });
    }
}

//UPDATE
export const updateC = async (req, res) => {
    try {
        let data = req.body;
        let { id } = req.params;
        
        let categoryUpdated = await Category.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );

        if (!categoryUpdated) return res.status(404).send({ message: `Category not found and not updated.` })
        return res.send({ message: `Category updated successfully.` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error updating category.` });
    }
}

//DELETE
export const deleteC = async (req, res) => {
    try {

        //obtener parametros
        let { id } = req.params;

        //Verificar si existe la categoria
        let categoryFinded = await Category.findOne({ _id: id });
        if (!categoryFinded) return res.status(404).send({ message: `Category not found and not deleted.` });

        //Verificar si es default
        console.log(categoryFinded);
        if (categoryFinded.isDefault) return res.status(400).send({ message: `Default category cannot be deleted.` });

        //verificar si la categoria esta asociada a productos.
        let products = await Product.find({ category: categoryFinded._id });
        if (products.length === 0) {
            //eliminar la categoria solicitada
            let deletedCategory = await Category.findOneAndDelete({ _id: id });
            //validar la eliminacion
            if (!deletedCategory) return res.status(400).send({ message: `Category not found and not deleted.` })
            return res.send({ message: `Category with name ${deletedCategory.name} deleted successfully.` })
        }


        //validar si hay alguna categoria por defecto
        let defaultC = await Category.findOne({ isDefault: true });
        if (!defaultC) return res.status(404).send({ message: `> Category default not exists. \n> Category cannot be deleted.` })

        // Actualiza todos los productos asociados a la categoría proporcionada
        let productsUpdated = await Product.updateMany({ category: id }, { category: defaultC._id });

        //validar si se actualizo
        if (productsUpdated.modifiedCount === 0) return res.status(404).send({ message: `Products not modified. Category not deleted.` });

        //eliminar la categoria solicitada
        let deletedCategory = await Category.deleteOne({ _id: id });
        if (deletedCategory.deletedCount === 0) return res.status(404).send({ message: `Category not deleted.` });

        //respuesta a usuario.
        return res.send({ message: `Deleted category successfully. Products modified to default.` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error deleting category.` });
    }
}