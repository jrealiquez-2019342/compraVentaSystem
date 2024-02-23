'use strict'

import {mongoose, model, Schema} from 'mongoose';

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Product name is required.']
    },
    description:{
        type: String,
        required: false
    },
    stock:{
        type: Number,
        validate:{
            validator: Number.isInteger,
            message: 'Stock must be an integer'
        },
        min: [0, 'Stock cannot be negative.'],
        default: 1,
        required: [true, 'Stock is required.']
    },
    price:{
        type: Number,
        min: [0, 'Price cannot be negative'],
        required: [true, 'Price is required.']
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required:[true, 'Category is required.']
    },
    sold:{
        type: Number,
        min: [0, 'sold cannot be negative'],
        default: 0
    }
}, {
    versionKey: false
});

export default model('Product', productSchema);
