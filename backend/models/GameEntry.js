const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
{
    gameNo:{
        type:Number,
        required:true
    },

    numbers:{
        type:[Number],
        required:true
    },

    powerball:{
        type:Number,
        required:true
    }

},
{
    _id:false
});


const playerSchema = new mongoose.Schema(
{

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },


    games:[
        gameSchema
    ],


    gameEntry:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"GamePool"
    },


    bidAmount:{
        type:Number,
        required:true
    },


    currencyDetails:{
        usdAmount:Number,
        localAmount:Number,
        localCurrency:String,
        exchangeRate:Number,
        userCountry:String
    },


    result:{
        division:Number,
        prize:{
            type:Number,
            default:0
        }
    },


    status:{
        type:String,
        enum:[
            "Pending",
            "Won",
            "Lost"
        ],
        default:"Pending"
    }

},
{
    _id:true
});



const gamePoolSchema = new mongoose.Schema(
{

    ticketType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"TicketType",
        required:true
    },


    gameType:{
        type:mongoose.Schema.Types.ObjectId,
    },


    gameCount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"GameCount",
        required:true
    },
    
    // =========================
    // COUNTRY FIELD ADDED
    // =========================
    country:{
        type:String,
        required:true,
        uppercase: true,
        trim: true,
        index: true
    },


    players:[
        playerSchema
    ],


    totalPlayers:{
        type:Number,
        default:0
    },


    totalAmount:{
        type:Number,
        default:0
    },


    drawNo:{
        type:Number,
        required:true
    },


    winningNumbers:{
        numbers:[Number],
        powerball:Number
    },


    resultDeclared:{
        type:Boolean,
        default:false
    },


    status:{
        type:String,
        enum:[
            "Open",
            "Closed",
            "Completed"
        ],
        default:"Open"
    }


},
{
    timestamps:true
});


// =========================
// UPDATED INDEXES WITH COUNTRY
// =========================
// Same game pool search with country
gamePoolSchema.index({
    ticketType:1,
    gameType:1,
    gameCount:1,
    country:1,
    status:1
});

// Separate index for country queries
gamePoolSchema.index({
    country:1,
    status:1,
    createdAt:-1
});

// Index for finding pools by country and draw number
gamePoolSchema.index({
    country:1,
    drawNo:1
});


module.exports = mongoose.model(
    "GamePool",
    gamePoolSchema
);