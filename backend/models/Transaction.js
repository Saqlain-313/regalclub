// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'USD',
    },
    usdAmount: {
        type: Number,
    },
    exchangeRate: {
        type: Number,
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    category: {
        type: String,
        enum: ['GAME_ENTRY', 'REFUND', 'DEPOSIT', 'WITHDRAWAL', 'WINNING'],
        required: true
    },
    description: String,
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    creditAfter: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);