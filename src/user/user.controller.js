'use strict'

import User from './user.model.js';
import { checkPassword, encrypt } from '../../utils/validator.js';

/*=========================== */
//  AUN NO ESTA TERMINADO
/*=========================== */

export const test = (req, res)=>{
    console.log('user test is running...');
    return res.send({message: `User test is running...`})
}
