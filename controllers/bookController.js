const bookModel = require('../models/bookModel')

const addBook = async (req, res) => {
    try {
        const { title, author, isbn, category } = req.body;
        if (!title || !author || !isbn || !category) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }
        const newBook = await bookModel.create({
            title,
            author,
            isbn,
            category
        })

        res.status(201).json({
            status: "success",
            message: "Book added successfully",
            Book: newBook,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to Add a book, Please try again later",
        });
    }
};

const getAllBooks = async (req, res) => {
    try {
        const books = await bookModel.find();
        res.status(200).json({
            status: "success",
            books: books,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to find books, Please try again later",
        });
    }
};

const getBook = async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ status: "failed", message: "book not found" });
        }
        res.status(200).json({ status: "success", book: book });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to find book, Please try again later",
        });
    }
};

const updateBook = async (req, res) => {
    try {
        const updatedFields = {};
        if (req.body.title) updatedFields.title = req.body.title;
        if (req.body.author) updateFields.author = req.body.author;
        if (req.body.isbn) updateFields.isbn = req.body.isbn;

        const updatedBook = await bookModel.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" })
        }
        res.status(201).json({
            status: "success",
            message: "book updated Successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to update book, Please try again later",
        });
    }
}

const deleteBook = async (req, res) => {
    try {
        const book = bookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ status: "failed", message: "Book not found" });
        }
        await bookModel.deleteOne(book);
        res.status(200).json({ status: "success", message: "Book deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to delete a book",
        });
    }
}

module.exports = {
    addBook,
    getAllBooks,
    getBook,
    updateBook,
    deleteBook
}