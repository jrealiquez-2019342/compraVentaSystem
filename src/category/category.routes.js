import { Router } from 'express';
import { test, save, get, deleteC, updateC} from './category.controller.js';
import { validateJwt, isAdmin } from './../middlewares/validate-jwt.js';

const api = Router();

/*========================== */
/*       Rutas Publicas      */
/*========================== */

//test
api.get('/test', test);

/*============================ */
/*Rutas Privadas - Compartidas */
/*============================ */

//Visualizar todas las categorias
api.get('/get', [validateJwt], get);

/*========================== */
/*  Rutas Privadas - Admin   */
/*========================== */

//Agregar categoria
api.post('/save', [validateJwt, isAdmin], save);

//Editar categoria
api.put('/update/:id', [validateJwt, isAdmin], updateC)

// eliminar categoria
api.delete('/delete/:id', [validateJwt, isAdmin], deleteC);


export default api;