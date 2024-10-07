const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;