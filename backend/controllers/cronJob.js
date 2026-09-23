const cron=require('node-cron'); const {createTrade,checkwhichUserIsWinner}=require('./betController'); let latestPeriod=null;
cron.schedule('* * * * *',async()=>{try{latestPeriod=await createTrade();await checkwhichUserIsWinner();}catch(e){console.error('cron',e.message)}});
const getLatestTrade=(req,res)=>latestPeriod?res.json({success:true,period:latestPeriod}):res.status(404).json({success:false,message:'No trade period available'});
module.exports={getLatestTrade};
