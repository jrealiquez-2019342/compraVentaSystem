import {Schema, model} from 'mongoose';

const categorySchema = Schema({
    name:{
        type: String,
        unique: [true, 'Name is unique.'],
        required: [true, 'Name is required.']
    },
    description:{
        type: String,
        required: false
    },
    isDefault:{
        type: Boolean,
        default: false
    }
}, {
    versionKey: false
});

export default model('Category', categorySchema);