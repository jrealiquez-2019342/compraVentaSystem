import {Schema, model} from 'mongoose';

const cartSchema = Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'User Id is required.']
    },
    products:[{
        quantity:{
            type: Number,
            validate:{
                validator: Number.isInteger,
                message: 'Quantity must be an integer.'
            },
            min: [1, 'Quantity cannot be negative.'],
            default: 1,
            required: [true, 'Quantyity is required.']
        },
        product:{
            type: Schema.Types.ObjectId,
            ref:'Product',
            required: [true, 'Product is required']
        },
        price:{
            type: Number,
            min:[0.00, 'Price cannot bet negative.'],
            required: [true, 'Price is required.']
        }
    }],
    status:{
        type: String,
        enum:['ACTIVE', 'PENDING', 'COMPLETED'],
        default: 'ACTIVE'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
},{
    versionKey: false
});

export default model('Cart', cartSchema);