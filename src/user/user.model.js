'use strict'

import {Schema, model} from 'mongoose';

const userSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required.']
    },
    surname: {
        type: String,
        required: [true, 'Surname is required.']
    },
    username: {
        type: String,
        unique: [true, 'Username must be unique.'],
        lowercase: true,
        required: [true, 'Username is required.']
    },
    password: {
        type: String,
        minLength: [8, 'Password min must be 8 characters.'],
        required: [true, 'Password is required.']
    },
    email: {
        type: String,
        required: [true, 'Email is required.']
    },
    phone:{
        type: String,
        minLength: [8, 'The phone number must be 8 digits long.'],
        maxLength: [8, 'The phone number must be 8 digits long.'],
        required: [true, 'Phone is required.']
    },
    role:{
        type: String,
        uppercase: true,
        enum:['ADMIN', 'CLIENT'],
        required: [true, 'Role is required.']
    }
});

//exportar el modelo.

export default model('User', userSchema);