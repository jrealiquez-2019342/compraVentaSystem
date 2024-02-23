import { Router } from 'express';
import { test } from './cart.controller';

const api = Router();

api.get('/test', test);

export default api;