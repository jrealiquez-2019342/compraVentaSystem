import { Router } from "express";
import { login, register, registerClient, test, update, deleteU} from "./user.controller.js";
import { validateJwt, isAdmin, isClient } from './../middlewares/validate-jwt.js';

const api = Router();

//=========================//
//      Rutas Publicas    //
//=======================//

//test
api.get('/test', test);

//registrar Admin
api.post('/register', register);

//registrar cliente
api.post('/registerClient', registerClient);

//logearse
api.post('/login', login);

/*============================ */
/*Rutas Privadas - Compartidas */
/*============================ */

//actualizar usuario
api.put('/update', [validateJwt], update);

//eliminar usuario
api.put('/delete', [validateJwt], deleteU);

export default api;