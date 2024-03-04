import { Schema, model } from 'mongoose';

const billSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id is required.']
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
        enum: ['Cash', 'Credit Card', 'Debit Card'],
        default: 'Cash'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default model('Bill', billSchema);