'use strict'

export const test = (req, res)=>{
    console.log('bill test is running...');
    res.send({message: `Bill test is running...`});
}