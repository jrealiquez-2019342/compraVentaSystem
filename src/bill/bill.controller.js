'use strict'

import Cart from './../cart/cart.model.js';
import Product from './../product/product.model.js';
import Bill from './bill.model.js';
import PDFDocument from 'pdfkit';

//funcion para realizar test
export const test = (req, res) => {
    console.log('bill test is running...');
    res.send({ message: `Bill test is running...` });
}

//funcion para creacion de facturas con carrito de compras
export const createBill = async (req, res) => {
    try {
        //obtenemos los datos del usuario logeado
        let user = req.user;

        /*
        * Obtenemos la data del body
        * podemos capturar el nit y el tipo de pago
        * */
        let data = req.body;

        //validamos que exista el carrito de compras
        let cartFounded = await Cart.findOne({
            $and: [
                { user: user._id },
                { status: 'ACTIVE' }
            ]
        });

        if (!cartFounded) return res.status(404).send({ message: `Cart not found.` });

        //agregamos el usuario a la data.
        data.user = user._id;

        //validamos si el usuario no ingresó un NIT
        if (!data.nit) {
            data.nit = 'CF';
        }


        /*
        * Sumar la cantidad por el precio de los productos en el carrito,
        * agregarlo al data.price que es el subtotal
        * si no hay promociones (a futuro) dar el total. 
        */

        data.price = 0.00;
        //ultima interaccion de compras en vivo antes de generar la factura
        /*
        * Puede suceder que quede un unico producto en stock, dos personas la vean
        * pero una finaliza la compra antes de la otra, por ende realizo la validacion
        * de stock antes de generar la factura con los productos.
        * */
        for (const item of cartFounded.products) {
            let product = await Product.findById(item.product._id);

            if (!product || product.stock < item.quantity) {
                //respuesta si existe el producto
                if (product) return res.status(400).send({ message: `Product ${product.name} is out of stock or insufficient quantity.` });
                //respuesta si no existe el producto
                return res.status(400).send({ message: `Product ${item.product} is out of stock or insufficient quantity.` });
            }

            //descontamos la cantidad en stock del producto.
            product.stock -= item.quantity;
            await product.save();

            //sumamos en el subtotal
            data.price += item.quantity * product.price;
        }

        console.log(data.price);
        //si es admin tiene 10% de descuento
        let descuento = 0.00;
        if (user.role == 'ADMIN') {
            descuento = data.price * 0.10;
            //agregamos un comentario de descuento en la factura
            data.comment = '10% discount for administrator'
        }

        //agregamos el total a la data.
        data.total = data.price - descuento;

        //validamos si tiene un tipo de pago
        if (!data.pay) {
            data.pay = 'CASH';
        }

        //cambiamos el status del carrito de compras
        cartFounded.status = 'COMPLETED';
        await cartFounded.save();

        data.cart = cartFounded._id;

        //generamos la factura
        console.log(data);
        let billing = new Bill(data);
        await billing.save();

        return res.send({ message: `Successful purchase!` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Billing error. | createBill` });
    }
}

//funcion para ver nuestras facturas
export const get = async (req, res) => {
    try {
        //obtenemos el usuario logeado
        let user = req.user;

        //buscamos las facturas del cliente
        let findBills = await Bill.find({ user: user._id }).populate({
            path: 'user',
            select: '_id name surname'
        }).populate({
            path: 'cart',
            select: '-user -createdAt -updatedAt',
            populate: {
                path: 'products.product',
                select: '-_id name'
            }
        })

        if (!findBills) return res.status(404).send({ message: `Ohhpss!! You dont have bills 😢` });

        return res.send({ findBills });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting bills | get` });
    }
}

//funcion para generar pdf una factura en especifico

export const getPdf = async (req, res) => {
    try {

        //capturamos el id de la factura
        let { id } = req.params;

        //buscamos la factura
        let bill = await Bill.findOne({ _id: id }).populate({
            path: 'user',
            select: '_id name surname'
        }).populate({
            path: 'cart',
            select: '-user -createdAt -updatedAt',
            populate: {
                path: 'products.product',
                select: '-_id name'
            }
        });

        if (!bill) return res.status(404).send({ message: `Bill not found` });

        let doc = new PDFDocument()

        //titulo de la factura
        doc.fontSize(18).text('BILL', { align: 'center' });
        doc.moveDown();


        /*let tablaEncabezado = [
            ['Store: ', 'Oxxo #17'],
            ['Phone: ', '2424-2222'],
            ['Address: ', '7ma Av. 7-89 Zona 10 Guatemala'],
            ['Issued: ', bill.createdAt],
        ]

        doc.moveDown();

        let tablaUsuario = [
            ['Customer: ', `${bill.user.name} ${bill.user.surname}`],
            ['NIT: ', `${bill.nit}`],
            ['Payment Type: ', `${bill.pay}`],
        ]*/

        //obtener los productos de cart
        // Detalles de los productos en el carrito
        //titulo de la factura
        doc.fontSize(18).text('DETAIL', { underline: true });
        doc.moveDown();

        doc.fontSize(15).text(`Store: Oxxo #117`);
        doc.fontSize(15).text(`Phone: 2424-2424`);

        doc.fontSize(15).moveUp().moveUp().moveUp().moveUp().text(`Customer: ${bill.user.name} ${bill.user.surname}`, { align: 'right' });
        doc.fontSize(15).text(`NIT: ${bill.nit}`, { align: 'right' });
        doc.fontSize(15).text(`Payment Type: ${bill.pay}`, { align: 'right' });

        doc.moveDown();
        doc.fontSize(15).text(`Address: 7ma Av. 7-89 Zona 10 Guatemala`);
        doc.fontSize(15).text(`Issued: ${bill.createdAt}`);

        doc.moveDown();
        doc.fontSize(15).text('QUANTITY', { align: 'left' }).moveUp().text('PRODUCT', { align: 'center' }).moveUp().text('PRICE', { align: 'right' });
        doc.fontSize(15).text('---------------------------------------------------------------------------------------------')

        doc.moveDown();

        bill.cart.products.forEach(product => {
            //precio redondeado a dos decimales
            let formattedPrice = product.price.toFixed(2);
            doc.fontSize(15).text(`${product.quantity}`, { align: 'left' }).moveUp().text(`   | ${product.product.name}`, { align: 'left' }).moveUp().text(`    | Q.${formattedPrice}`, { align: 'right' });
        });

        //pie de pagina
        //redondeamos el precio y el total
        let billPrice = bill.price.toFixed(2);
        let billTotal = bill.total.toFixed(2);


        doc.moveDown();
        doc.fontSize(12).text('---------------------------------------------------------------------------------------------------------------------')
        doc.fontSize(15).text(`Comment: ${bill.comment}`);
        doc.fontSize(15).text(`Subtotal: Q.${billPrice}`, { align: 'right' });
        doc.fontSize(15).text(`Total: Q.${billTotal}`, { align: 'right' });
        doc.fontSize(15).text(``);

        // Nombre del archivo PDF
        const fileName = `bill_${bill.createdAt}.pdf`;

        // Configurar los encabezados para descargar el archivo PDF
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Enviar el PDF al cliente como respuesta
        doc.pipe(res);
        doc.end();
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error generating PDF` });
    }
}