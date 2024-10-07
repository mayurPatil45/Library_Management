const express = require('express')
const userController = require('../controllers/userController')
const passport = require('passport')
const setAuthHeader = require('../middleware/accessTokenAutoRefresh')
const isAdmin = require('../middleware/checkAdmin')

require('../config/passportStretegyJwt')

const router = express.Router();

router.post("/register", userController.userRegistration);
router.post("/verify-email", userController.verifyEmail);
router.post("/login", userController.userLogin);
router.post("/refresh-token", userController.getNewAccessToken);
router.post("/reset-password", userController.sendPasswordResetEmail);
router.post("/reset-password/:id/:token", userController.passwordReset);

router.get("/me", setAuthHeader, passport.authenticate("jwt", { session: false }), userController.userProfile);
router.post("/change-password", setAuthHeader, passport.authenticate("jwt", { session: false }), userController.changePassword)
router.post("/logout", setAuthHeader, passport.authenticate("jwt", { session: false }), userController.userLogout);

// Admin Routes
router.get("/user", setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, userController.getAllUsers)
router.get("/user/:id", setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, userController.getUserById)
router.delete("/user/:id", setAuthHeader, passport.authenticate("jwt", { session: false }), isAdmin, userController.deleteUser)

module.exports = router;