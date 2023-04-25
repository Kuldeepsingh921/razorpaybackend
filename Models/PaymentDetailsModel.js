const mongoose = require('mongoose')

const PaymentDetailsSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    phone:{type:String,required:true},
    address:{type:String,required:true},
    amount:{type:String,required:true},
    batch:{type:String,required:true},
    order_id:{type:String,required:false,unique:true},
    paymentstatus:{type:String,required:true,default:"initiated"},
    payment_id:{type:String,required:false},
    description:{type:String,required:false},
    source:{type:String,required:false},
    step:{type:String,required:false},
    reason:{type:String,required:false},
},{versionKey:false,timestamps:true})

const PaymentDetailsModel=mongoose.model('paymentdetail',PaymentDetailsSchema)

module.exports=PaymentDetailsModel