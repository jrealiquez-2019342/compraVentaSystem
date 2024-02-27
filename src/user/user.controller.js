'use strict'

import User from './user.model.js';
import { checkPassword, encrypt } from '../../utils/validator.js';

/*=========================== */
//  AUN NO ESTA TERMINADO
/*=========================== */

export const test = (req, res)=>{
    console.log('user test is running...');
    return res.send({message: `User test is running...`})
}

export const register = async (req, res) => {
    try {
        let data = req.body;

        //validar que no haya un user existente
        let findUser = await User.findOne({ username: data.user });
        if (findUser) return res.status(409).send({ message: `Username already exists.` });
        //validar que el correo no este en uso
        let findEmail = await User.findOne({ email: data.email });
        if (findEmail) return res.status(409).send({ message: `Email already in use.` })

        //encriptar la contrasenia
        data.password = await encrypt(data.password);

        //si el no ingreso role, le asignamos uno por defecto
        if (!data.role) data.role = 'CLIENT';

        //creamos nuestro usuario
        let user = new User(data);
        //guardamos en mongo
        await user.save();
        //respondemos al usuario
        return res.send({ message: `Registered successfully. \nCan be logged with username ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error registering user. | `, err: err.errors })
    }
}

export const registerClient = async (req, res) => {
    try {
        let data = req.body;

        //validar que no haya un user existente
        let findUser = await User.findOne({ username: data.username });
        if (findUser) return res.status(409).send({ message: `Username already exists.` });
        //validar que el correo no este en uso
        let findEmail = await User.findOne({ email: data.email });
        if (findEmail) return res.status(409).send({ message: `Email already in use.` })

        //encriptar la contrasenia
        data.password = await encrypt(data.password);

        //le asignamos rol por defecto
        data.role = 'CLIENT';
        //creamos nuestro usuario
        let user = new User(data);
        //guardamos en mongo
        await user.save();
        //respondemos al usuario
        return res.send({ message: `Registered successfully. \nCan be logged with username ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error registering user. | `, err: err.errors })
    }
}