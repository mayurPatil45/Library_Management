const categoryModel = require('../models/categoryModel')

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }
        const existingCategory = categoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ status: "failed", message: "Category already exists" });
        }
        const newCategory = await categoryModel.create({
            name,
            description
        })

        res.status(201).json({ status: "success", message: "Category added successfully", category: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to create category, Please try again later",
        });
    }
}

const getAllCategory = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.status(200).json({ status: "success", categories: categories });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            status: "failed",
            message: "Something went wrong, category not found",
        });
    }
}

const updateCategory = async (req, res) => {
    try {
        const existingCategory = await categoryModel.findById(req.params.id);
        if (!existingCategory) {
            return res.status(404).json({ status: "failed", message: "Category not found" });
        }
        const name = req.body.name !== undefined ? req.body.name : existingCategory.name;
        const description = req.body.description !== undefined ? req.body.description : existingCategory.description;
        await categoryModel.findByIdAndUpdate(req.params.id, {
            $set: { name, description }
        })
        res.status(201).json({ status: "success", message: "Category updated successfully" })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to update category, Please try again later",
        });
    }
}

const deleteCateogry = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ status: "failed", message: "Category not found" });
        }
        await categoryModel.deleteOne(category);
        res.status(200).json({
            status: "success",
            message: "Category deleted successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to delete a category",
        });
    }
}

module.exports = {
    createCategory,
    getAllCategory,
    updateCategory,
    deleteCateogry,
}