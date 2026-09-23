const mongoose=require('mongoose');
const schema=new mongoose.Schema({userId:{type:Number,index:true},message:{type:String,required:true},image:{type:String,default:null},time:{type:String,default:''}},{timestamps:true,versionKey:false});
module.exports=mongoose.models.Message||mongoose.model('Message',schema);
