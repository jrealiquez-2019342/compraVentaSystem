import {Schema, model} from 'mongoose';

const cartSchema = Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'User Id is required.']
    },
    products:[{
        product:{
            type: Schema.Types.ObjectId,
            ref:'Product'
        },
        quantity:{
            type: Number,
            validate:{
                validator: Number.isInteger,
                message: 'Quantity must be an integer.'
            },
            min: [0, 'Quantity cannot be negative.'],
            default: 1
        }
    }],
    status:{
        type: String,
        enum:['active', 'pending', 'completed'],
        default: 'active'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});

export default model('Cart', cartSchema);