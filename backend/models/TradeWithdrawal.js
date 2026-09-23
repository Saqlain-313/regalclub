const mongoose=require('mongoose');
const schema=new mongoose.Schema({orderId:{type:String,unique:true,index:true},userId:{type:Number,index:true},amount:{type:Number,required:true},type:{type:String,required:true},usdt:{type:String,required:true},status:{type:Number,default:0,index:true},time:{type:String,default:''}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Withdrawal||mongoose.model('Withdrawal',schema);
