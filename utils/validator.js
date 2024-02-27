'use strict'

import {hash, compare} from 'bcrypt';

//encriptar
export const encrypt = (password)=>{
    try {
        return hash(password, 10);
    } catch (err) {
        console.error(err);
        return err;
    }
}

//Validar password

export const checkPassword = async(password, passEncrypt)=>{
    try {
        return await compare(password, passEncrypt);
    } catch (err) {
        console.error(err);
        return err;
    }
}

//validar actualizacion
export const checkUpdate = (data, userId)=>{
    if(userId){
        if(
            Object.entries(data).length === 0 ||
            data.password || //si cambia la password devuelve false
            data.password == ''|| //si envia la password vacia
            data.role || //si modifica el rol
            data.role == '' //si deja el rol vacio.
        )return false;
        return true;
    }else{
        if(
            //admin
            Object.entries(data).length === 0 ||
            data.password || //si cambia la password devuelve false
            data.password == '' //si envia la password vacia
        )return false;
        return true;
    }
}



