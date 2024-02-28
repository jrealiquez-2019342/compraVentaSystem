import { Router } from "express";
import { login, register, registerClient, test } from "./user.controller.js";

const api = Router();

//rutas publicas
api.get('/test', test);
api.post('/register', register);
api.post('/registerClient', registerClient);
api.post('/login', login);

export default api;