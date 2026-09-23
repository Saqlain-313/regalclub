const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  userId:{type:Number,unique:true,index:true}, name:{type:String,default:'Unknown'},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true}, password:{type:String,required:true},
  plane_password:{type:String,default:''}, country:{type:String,default:''}, currency:{type:String,default:''},
  token:{type:String,default:''}, otp:{type:String,default:null}, otpExpiresAt:{type:Date,default:null},
  money:{type:Number,default:0}, deposit:{type:Number,default:0}, recharge:{type:Number,default:0},
  role:{type:Number,default:1}, status:{type:Number,default:0}
},{timestamps:true,versionKey:false});
module.exports=mongoose.models.User||mongoose.model('User',userSchema);
