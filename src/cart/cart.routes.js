import { Router } from 'express';
import { test, addProducts, cartActive, remove } from './cart.controller.js';
import { validateJwt } from './../middlewares/validate-jwt.js';

const api = Router();

api.get('/test', test);

/*===================*/
/* Rutas Compartidas */
/*===================*/

api.post('/addProduct', [validateJwt], addProducts);
api.get('/get', [validateJwt], cartActive);
api.put('/remove/:id', [validateJwt], remove);

export default api;