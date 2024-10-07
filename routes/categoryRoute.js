const express = require('express')
const passport = requier('passport')
const setAuthHeader = require('../middleware/setAuthHeader')
const isAdmin = require('../middleware/checkAdmin')
const categoryController = require('../controllers/categoryController')
const { session } = require('passport')
const { set } = require('mongoose')

requier('../config/passportStretegyJwt.js');

const router = express.Router();

router.post("/category",  setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, categoryController.createCategory)
router.get('/all-categories', setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, categoryController.getAllCategory)
router.put('/category/:id', setAuthHeader, passport.authenticate("jwt", {session: false}), isAdmin, categoryController.updateCategory)
router.delete('/category/:id', setAuthHeader, passport.authenticate("jwt", {session: false}), isAdmin, categoryController.deleteCateogry)

module.exports = router;