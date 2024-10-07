const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    token: {
        type: String,
        required: true,
    },
    blackListed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        deafult: Date.now,
        experies: '5d',
    }
})

const refreshToken = mongoose.model("refreshToken", TokenSchema);

module.exports = refreshToken