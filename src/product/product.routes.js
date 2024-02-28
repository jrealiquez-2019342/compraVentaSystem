import { Router } from 'express'
import { test, save, update, deleteP, get, getProduct, productOut, searchProduct } from './product.controller.js'
import { validateJwt, isAdmin, isClient } from './../middlewares/validate-jwt.js';

const api = Router();

//rutas publicas
api.get('/test', test);


//================//
//rutas privadas //
//==============//


//=========================//
//rutas privadas -- ADMIN //
//=======================//

//Agregar productos a la base de datos
api.post('/save', [validateJwt, isAdmin], save);

//Visualizar producto individual
api.get('/getProduct/:id', getProduct);

//visualizar catalogo completo
api.get('/get', get);

//editar detalles especificos de un producto
api.put('/update/:id', update);

//productos agotados
api.get('/getProductOut', [validateJwt, isAdmin], productOut);

//productos mas vendidos

//eliminar un producto
api.delete('/delete/:id', deleteP);

//=========================//
//rutas privadas -- CLIENT //
//=========================//

//catalogo productos mas vendidos

//buscar productos por nombre
api.post('/searchProduct', searchProduct);

//explorar las categorias existentes

// productos segun la categoria proporcionada



export default api;