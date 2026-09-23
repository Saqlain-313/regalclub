const mongoose=require('mongoose');
const schema=new mongoose.Schema({userId:{type:Number,index:true},amount:{type:Number,required:true},remark:{type:String,required:true},status:{type:Number,default:0},time:{type:String,default:''},orderId:{type:String,default:''}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Transaction||mongoose.model('Transaction',schema);
