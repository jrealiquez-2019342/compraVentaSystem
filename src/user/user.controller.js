'use strict'

import User from './user.model.js';
import { checkPassword, encrypt, checkUpdate } from './../../utils/validator.js';
import { generateJwt } from './../../utils/jwt.js';

//Funcion para realizar test
export const test = (req, res) => {
    console.log('user test is running...');
    return res.send({ message: `User test is running...` })
}

//Funcion para registrar administradores
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
        if (!data.role) data.role = 'ADMIN';

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

//Funcion para registrar clientes
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

//Funcion para logearse con usuario o correo (clientes y administradores)
export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) return res.status(404).send({ message: `Invalid credentials.` })

        //validamos que el usuario este activo
        if (user.status == false) return res.status(403).send({ message: `You don't have access | Please contact technical support.` });

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
        //si no coincide la contrasenia
        return res.status(400).send({ message: `Invalid credentials` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `ERROR IN LOGIN` });
    }
}

//Funcion para modificar el usuario
export const update = async (req, res) => {
    try {
        //extraer valores de req.user
        //let { role, uid } = jwt.verify(token, process.env.SECRET_KEY);
        let { role, uid } = req.user;

        //extraer datos a actualizar
        let data = req.body;

        switch (role) {
            case 'ADMIN':
                //verificamos si dentro del body deseamos modificar a un usuario en especifico
                if (data.userId) {
                    //validar que el id del usuario exista
                    let userFind = await User.findOne({ _id: data.userId });
                    if (!userFind) return res.status(404).send({ message: `User to modify not found.` });

                    //Si es admin y no coincide el id con el registrado, no permitir modificar
                    if (uid !== userFind._id && userFind.role == 'ADMIN') return res.status(403).send({ message: `You cannot edit another administrator` });

                    //quedan dos opciones, si es su mismo id o es otro usuario con rol cliente
                    switch (userFind.role) {
                        case 'CLIENT':
                            //validar si trae datos y si se pueden modificar.
                            if (!checkUpdate(data, false, true)) return res.status(400).send({ message: `Have submitted some data that cannot be updated or missing data` });
                            break;
                        default:
                            //validar si trae datos y si se pueden modificar.
                            if (!checkUpdate(data, false, false)) return res.status(400).send({ message: `Have submitted some data that cannot be updated or missing data` });
                            break;
                    }
                } else {
                    //se va a modificar el mismo admin
                    //validar si trae datos y si se pueden modificar.
                    if (!checkUpdate(data, false)) return res.status(400).send({ message: `Have submitted some data that cannot be updated or missing data` });
                }
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

/*
    FUNCION PARA ELIMINAR USUARIO
    unicamente es un cambio de status
    para evitar problemas con facturas
*/

export const deleteU = async (req, res) => {
    try {

        //obtenemos los datos del usuario logeado
        let { _id, role, username, password } = req.user;

        //validar si el body tiene datos (eliminar a alguien mas)
        let data = req.body;

        if (data && Object.entries(data).length !== 0) {
            //pedir contraseña de la cuenta para confirmar eliminacion
            if (!data.password) return res.staus(400).send({ message: `Confirmation password required.` });
            switch (role) {
                case 'ADMIN':
                    //validamos que las contrasenias coincidan.
                    if (await checkPassword(data.password, password)) {
                        let pivot;
                        if (data.user) {
                            //buscamos al usuario a modificar
                            let updated = await User.findOneAndUpdate(
                                { _id: data.user },//buscamos
                                { $set: { status: false } }//actualizamos el valor
                            );
                            pivot = updated;
                        } else {
                            let updated = await User.findOneAndUpdate(
                                { _id },//buscamos
                                { $set: { status: false } }//actualizamos el valor
                            );
                            pivot = updated;
                        }
                        //si el usuario no fue encontrado
                        if (!pivot) return res.status(400).send({ message: `User not found and not deleted. | Admin` });
                        //actualizado con exito
                        return res.send({ message: `@${pivot.username} deleted successfully.` });
                    }

                    return res.status(400).send({ message: `Incorrect password` });

                default:
                    console.log('entrando a default')
                    //validamos si un cliente quiere eliminar a otro
                    if (data.user) return res.status(403).send({ message: `You do not have the necessary permissions | deleteU` });

                    //validamos contrasenia
                    if (await checkPassword(data.password, password)) {

                        let updated = await User.findOneAndUpdate(
                            { _id },//buscamos
                            { $set: { status: false } }//actualizamos el valor
                        );

                        //si el usuario no fue encontrado
                        if (!updated) return res.status(400).send({ message: `User not found and not deleted.` });
                        //actualizado con exito
                        return res.send({ message: `@${updated.username} deleted successfully.` });
                    }
                    return res.status(400).send({ message: `Incorrect password` });
            }
        } else {
            return res.status(400).send({ message: `Error: Data is empty` });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error deleting account.` });
    }
}


/* ADMIN AL ARRANCAR EL PROYECTO */
//funcion para crear un administrador por defecto.
export const createAdmin = async () => {
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
            return console.log({ message: `Registered successfully. \nCan be logged with username ${admin.username} and pass 12345` })
        }
        console.log({ message: `Can be logged with username ${user.username}` });

    } catch (err) {
        console.error(err);
        return err;
    }
}