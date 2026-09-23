const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true},price:{type:Number,required:true},image:{type:String,default:null},time:{type:String,default:''}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Leaderboard||mongoose.model('Leaderboard',schema);
