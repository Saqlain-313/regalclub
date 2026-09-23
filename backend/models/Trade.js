const mongoose=require('mongoose');
const schema=new mongoose.Schema({period:{type:Number,unique:true,index:true},tradeType:{type:String,default:'BUY'},open:{type:Number,default:0},high:{type:Number,default:0},low:{type:Number,default:0},close:{type:Number,default:0},x:{type:Date,default:Date.now},status:{type:Number,default:0,index:true},result:{type:String,default:''},trade_no:{type:Number,default:0}}, {timestamps:true,versionKey:false});
module.exports=mongoose.models.Trade||mongoose.model('Trade',schema);
