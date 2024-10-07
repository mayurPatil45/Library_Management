const express = require('express')
const passport = require('passport')
const setAuthHeader = require('../middleware/accessTokenAutoRefresh')
const isAdmin = require('../middleware/checkAdmin')
const bookController = require('../controllers/bookController')

require('../config/passportStretegyJwt')
const router = express.Router();

router.get("/", setAuthHeader, passport.authenticate("jwt", { session: false}), bookController.getAllBooks);
router.post("/book", setAuthHeader, passport.authenticate("jwt", {session: false}), isAdmin, bookController.addBook);
router.get("/book/:id",setAuthHeader,passport.authenticate("jwt", { session: false }),bookController.getBook);
router.put("/book/:id", setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, bookController.updateBook);
router.delete("/book/:id", setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, bookController.deleteBook);

module.exports = router;