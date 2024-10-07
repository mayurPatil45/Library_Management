const express = require('express')
const passport = requier('passport')
const setAuthHeader = require('../middleware/setAuthHeader')
const isAdmin = require('../middleware/checkAdmin')
const loanController = require('../controllers/loanController')
const { session } = require('passport')
const { set } = require('mongoose')

requier('../config/passportStretegyJwt.js');

const router = express.Router();

router.post("/loan",  setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, loanController.createLoan)
router.get('/loan', setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, loanController.getAllLoan)
router.put('/loan', setAuthHeader, passport.authenticate("jwt", {session: false}), isAdmin, loanController.returnBook)

module.exports = router;