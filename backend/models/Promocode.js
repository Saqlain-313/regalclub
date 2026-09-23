const mongoose=require('mongoose');
const schema=new mongoose.Schema({code:{type:String,required:true,unique:true,index:true},percent:{type:Number,default:0},deposit:{type:Number,default:0},time:{type:String,default:''},status:{type:Number,default:1}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Promocode||mongoose.model('Promocode',schema);
