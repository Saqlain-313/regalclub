const mongoose=require('mongoose');
const schema=new mongoose.Schema({orderId:{type:String,unique:true,index:true},userId:{type:Number,index:true},amount:{type:Number,required:true},bonus:{type:Number,default:0},type:{type:String,default:''},utrNo:{type:String,default:''},image:{type:String,default:''},status:{type:Number,default:0,index:true},gatewayOrderNo:{type:String,default:''},tradeResult:{type:String,default:''},paidAt:{type:Date,default:null},time:{type:String,default:''}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Recharge||mongoose.model('Recharge',schema);
