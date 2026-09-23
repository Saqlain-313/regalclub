const mongoose=require('mongoose');
const schema=new mongoose.Schema({trade:{type:String,default:'-1'},control:{type:String,default:'-1'},telegram:{type:String,default:''},usdt:{type:String,default:''},usdt2:{type:String,default:''},usdt3:{type:String,default:''},usdtImg:{type:String,default:''},usdtImg2:{type:String,default:''},usdtImg3:{type:String,default:''}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Admin||mongoose.model('Admin',schema);
