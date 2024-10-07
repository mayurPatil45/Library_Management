const mongoose = require('mongoose')

const LoanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        require: true,
    },
    loanDate: {
        type: Date,
        default: Date.now,
    },
    returnDate: {
        type: Date,
        default: null,
    },
    isReturned: {
        type: Boolean,
        default: false,
    }
})

const Loan = mongoose.model("Loan", LoanSchema);

module.exports = Loan;