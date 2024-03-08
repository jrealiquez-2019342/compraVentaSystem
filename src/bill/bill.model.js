import { Schema, model } from 'mongoose';

const billSchema = Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id is required.']
    },
    nit: {
        type: String,
        minLength: [2, 'Nit min length must be two characters. | CF'],
        required: [true, 'NIT is required']
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: [true, 'Cart Id is required']
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative.'],
        required: [true, 'Price / subtotal is required.']
    }, total: {
        type: Number,
        min: [0, 'Price cannot be negative.'],
        required: [true, 'Total is required.']
    },
    pay: {
        type: String,
        enum: ['CASH', 'CREDIT CARD', 'DEBIT CARD'],
        default: 'CASH'
    },
    comment: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

export default model('Bill', billSchema);