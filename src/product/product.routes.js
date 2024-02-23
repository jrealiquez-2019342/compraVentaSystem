import { Router } from 'express'
import { test, save, update, deleteP, get, getProduct, productOut, searchProduct } from './product.controller.js'

const api = Router();

api.get('/test', test);
api.get('/get', get);
api.get('/getProduct/:id', getProduct);
api.get('/getProductOut', productOut);
api.post('/searchProduct', searchProduct);
api.post('/save', save);
api.put('/update/:id', update);
api.delete('/delete/:id', deleteP);

export default api;