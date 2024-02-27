'use strict'

import User from './user.model.js';
import { checkPassword, encrypt } from '../../utils/validator.js';
import { generateJwt } from './../../utils/jwt.js';
import { checkUpdate } from '../../utils/validator.js';

/*=========================== */
//  AUN NO ESTA TERMINADO
/*=========================== */

export const test = (req, res) => {
    console.log('user test is running...');
    return res.send({ message: `User test is running...` })
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

export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) return res.status(404).send({ message: `Invalid credentials.` })

        if (await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }

            //generar el token y enviarlo como respuesta.
            let token = await generateJwt(loggedUser);
            return res.send({
                message: `WELCOME ${user.username}`,
                loggedUser,
                token
            })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `ERROR IN LOGIN` });
    }
}


export const update = async (req, res) => {
    try {

        //extraer valores de req.user
        //let { role, uid } = jwt.verify(token, process.env.SECRET_KEY);
        let { role, uid } = req.user;

        //extraer datos a actualizar
        let data = req.body;

        switch (role) {
            case 'ADMIN':
                //validar si trae datos y si se pueden modificar.
                if (!checkUpdate(data, false)) return res.status(400).send({ message: `Have submitted some data that cannot be updated or missing data` });
                break;
            case 'CLIENT':
                //validar si trae datos y si se pueden modificar.
                if (!checkUpdate(data, uid)) return res.status(400).send({ message: `Have submitted some data that cannot be updated or missing data` });
                break;
        }

        //actualizar
        let updatedUser = await User.findOneAndUpdate(
            { _id: uid },
            data,
            { new: true }
        )

        //validar que se haya actualizado
        if (!updatedUser) return res.status(401).send({ message: `User not found and not updated.` });

        //respuesta al usuario
        return res.send({ message: `Update user`, updatedUser });
    } catch (err) {
        console.error(err);
        if (err.keyValue.username) return res.status(400).send({ message: `Username @${err.keyValue.username} is al ready token.` })
        return res.status(500).send({ message: `Error updating profile.` })
    }
}



/* ADMIN AL ARRANCAR EL PROYECTO */

export const createTeacher = async () => {
    try {
        let user = await User.findOne({ username: 'jnoj' });
        if (!user) {
            console.log('Creando admin...')
            let admin = new User({
                name: 'Josue',
                surname: 'Noj',
                username: 'jnoj',
                password: '12345',
                email: 'jnoj@kinal.org.gt',
                phone: '87654321',
                role: 'ADMIN'
            });
            admin.password = await encrypt(admin.password);
            await admin.save();
            return console.log({ message: `Registered successfully. \nCan be logged with username ${admin.username}` })
        }
        console.log({ message: `Can be logged with username ${user.username}` });

    } catch (err) {
        console.error(err);
        return err;
    }
}