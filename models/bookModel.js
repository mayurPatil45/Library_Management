const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    author: {
        type: String,
        require: true,
    },
    isbn: {
        type: String,
        unique: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    copies: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;