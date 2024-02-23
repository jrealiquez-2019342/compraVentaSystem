import { Router } from 'express';
import { test, save, get, deleteC, updateC} from './category.controller.js';

const api = Router();

api.get('/test', test);
api.get('/get', get);
api.post('/save', save);
api.delete('/delete/:id', deleteC);
api.put('/update/:id', updateC)

export default api;