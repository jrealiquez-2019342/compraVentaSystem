import { Router } from 'express';
import { createBill, test, get, getPdf } from './bill.controller.js';
import { validateJwt } from './../middlewares/validate-jwt.js';

const api = Router();

api.get('/test', test);
api.post('/buy', [validateJwt], createBill);
api.get('/get', [validateJwt], get);
api.get('/getPdf/:id', [validateJwt], getPdf);

export default api;