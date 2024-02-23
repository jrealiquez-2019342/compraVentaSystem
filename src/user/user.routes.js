import { Router } from "express";
import { registerAdmin, test } from "./user.controller.js";

const api = Router();

api.get('/test', test);
api.post('/registerAdmin', registerAdmin)

export default api;