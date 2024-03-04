import { Router } from 'express'
import { test, save, update, deleteP, get, getProduct, productOut, searchProduct, mostSelled, getProductCategory } from './product.controller.js'
import { validateJwt, isAdmin, isClient } from './../middlewares/validate-jwt.js';

const api = Router();

//rutas publicas
api.get('/test', test);


/*===============================*/
/* Rutas privadas -- Compartidas */
/*===============================*/

//visualizar catalogo completo
api.get('/get', [validateJwt], get);

//buscar productos por nombre
api.post('/searchProduct', [validateJwt], searchProduct);

//productos mas vendidos
api.get('/mostSelled', [validateJwt], mostSelled);

//productos por categoria
api.get('/byCategory/:id', [validateJwt], getProductCategory);

/*=========================*/
/*rutas privadas -- ADMIN  */
/*=========================*/

//Agregar productos a la base de datos
api.post('/save', [validateJwt, isAdmin], save);

//Visualizar producto individual
api.get('/getProduct/:id', [validateJwt, isAdmin], getProduct);

//editar detalles especificos de un producto
api.put('/update/:id', [validateJwt, isAdmin], update);

//productos agotados
api.get('/getProductOut', [validateJwt, isAdmin], productOut);

//eliminar un producto
api.delete('/delete/:id', [validateJwt, isAdmin], deleteP);

/*==========================*/
/* Rutas privadas -- CLIENT */
/*==========================*/

// productos segun la categoria proporcionada



export default api;