'use strict'

import Cart from './cart.model.js';
import Product from './../product/product.model.js';

//test
export const test = (req, res) => {
    console.log('cart test is running...');
    res.send({ message: `Cart test is running...` })
}

//Funcion para agregar productos al carrito
/*
* Si no hay un carrito ya existente para el usuario no crear,
* si ya tiene un carrito asignarle el producto automaticamente.
* Si el producto ya esta agregado, sumarle uno o al menos que ingrese una cantidad
* Si no ingresa cantidad desginar el producto con 1 default
*/

//CREATE
export const addProducts = async (req, res) => {
    try {
        //obtener la data con el producto y la cantidad
        let data = req.body;
        let { product, quantity } = data;
        //obtener datos del usuario logeado.
        let user = req.user;

        //valdamos que la data no venga vacia
        if (Object.entries(data).length == 0) return res.status(400).send({ message: `Data is empty` });

        //validar que el producto exista
        let findProduct = await Product.findOne({ _id: product });
        if (!findProduct) return res.status(404).send({ message: `Product not found.` });
        if (findProduct.stock < parseInt(quantity)) return res.status(400).send({ message: `Product ${findProduct.name} is out of stock or insufficient quantity.` });

        //verificamos que el usuario tenga un carrito de compras activo
        let cartFinded = await Cart.findOne(
            {
                $and: [
                    { user: user._id },
                    { status: 'ACTIVE' }
                ]
            }
        )

        //verificamos si agrego el cuantity
        if (!data.quantity) {
            data.quantity = 1;
        }

        //agregar productos al carro existente
        if (cartFinded) {
            console.log('carrito encontrado')

            if (cartFinded.products.length !== 0) {
                console.log('carrito diferente a cero')

                let productFoundInCart = false;

                for (const item of cartFinded.products) {
                    if (item.product == data.product) {
                        let pivot = await Product.findOne({ _id: item.product });
                        if (!pivot || pivot.stock < (item.quantity + parseInt(data.quantity))) {
                            if (pivot) return res.status(400).send({ message: `Product ${pivot.name} is out of stock or insufficient quantity. | cartFinded` });
                            return res.status(400).send({ message: `Product ${item.product} is out of stock or insufficient quantity. | cartfinded` });
                        }

                        //si no supera stock sumarle la cantidad
                        item.quantity += parseInt(data.quantity);

                        //validar si es 0 el valor o negativo entonces quitarlo del array

                        productFoundInCart = true;
                        break; // Ya que hemos encontrado el producto en el carrito, no hay necesidad de seguir iterando
                    }
                }

                if (!productFoundInCart) {
                    cartFinded.products.push({
                        product: data.product,
                        quantity: parseInt(data.quantity),
                        price: findProduct.price
                    });
                }
            } else {
                cartFinded.products.push({
                    product: data.product,
                    quantity: parseInt(data.quantity),
                    price: findProduct.price
                });
            }

            console.log('carrito guardando')
            await cartFinded.save();

            return res.send({ message: `cartUpdated...`, cartFinded });
        } else {
            console.log('carrito no encontrado')
            //crear un carrito nuevo
            data.user = user._id;
            let cart = new Cart(data);

            //generamos el nuevo producto
            let newProduct = {
                quantity,
                product,
                price: findProduct.price
            }

            cart.products.push(newProduct);

            await cart.save();

            return res.send({ message: `Product saved.`, cart});
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error adding products.` });
    }
}

//funcion para llamar al carrito de compras activo
//READ
export const cartActive = async (req, res) => {
    try {
        //obtenemos los datos del usuario
        let user = req.user;

        //buscamos el carrito activo
        let cartFounded = await Cart.findOne({
            $and: [
                { user: user._id },
                { status: 'ACTIVE' }
            ]
        }).populate({
            path: 'products.product',
            select: '_id name'
        });

        //validamos la busqueda del carrito
        if (!cartFounded) return res.status(404).send({ message: `Empty shopping cart.` });

        return res.send({ cartFounded });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting active cart | cartActive` });
    }
}

//funcion para remover algun producto por completo del carrito
//UPDATE/DELETE
export const remove = async (req, res) => {
    try {
        //capturamos el id del producto (subdocumento) a eliminar
        let { id } = req.params;

        //validamos que tenga un carrito activo
        let cartFound = await Cart.findOne({
            $and: [
                { user: req.user._id },
                { status: 'ACTIVE' }
            ]
        });

        if (!cartFound) {
            return res.status(404).send({ message: "Empty shopping cart." });
        }

        //validamos si el producto a eliminar existe en el array de productos
        let productToRemove = cartFound.products.find(product => product._id == id);

        if (!productToRemove) {
            return res.status(404).send({ message: "Product not found." });
        }

        //eliminamos el producto del carrito
        await Cart.updateOne(
            //ingresamos el id del carrito de compras activo
            { _id: cartFound._id },
            //$pull para remover el producto (subdocumento)
            { $pull: { products: { _id: id } } }
        );

        return res.send({ message: `Product removed` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error to remove product | remove` })
    }
}