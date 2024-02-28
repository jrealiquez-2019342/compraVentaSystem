import { Router } from 'express'
import { test, save, update, deleteP, get, getProduct, productOut, searchProduct, mostSelled } from './product.controller.js'
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
api.get('/getProduct/:id', [validateJwt, isAdmin],getProduct);

//visualizar catalogo completo
api.get('/get', [validateJwt, isAdmin],get);

//editar detalles especificos de un producto
api.put('/update/:id', [validateJwt, isAdmin],update);

//productos agotados
api.get('/getProductOut', [validateJwt, isAdmin], productOut);

//productos mas vendidos
api.get('/mostSelled', [validateJwt, isAdmin], mostSelled);

//eliminar un producto
api.delete('/delete/:id', [validateJwt, isAdmin],deleteP);

//=========================//
//rutas privadas -- CLIENT //
//=========================//

//catalogo productos mas vendidos

//buscar productos por nombre
api.post('/searchProduct', [validateJwt, isClient],searchProduct);

//explorar las categorias existentes

// productos segun la categoria proporcionada



export default api;