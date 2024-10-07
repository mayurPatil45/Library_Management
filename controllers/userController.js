const userModel = require('../models/userModel')
const otpModel = require('../models/ot')
const bcrypt = require('bcrypt')
const sendOTPMail = require('../utils/sendOTP')
const generateTokens = require('../utils/generateTokens')
const setTokenCookies = require('../utils/setTokenCookies')
const refreshAccessToken = require('../utils/refreshAccessToken')
const refreshTokenModel = require('../models/refreshTokenModel')
const jwt = require('jsonwebtoken')
const transporter = require('../config/emailConfig')

const userRegistration = async (req, res) => {
    try {
        const { name, email, password, password_confirmation } = req.body;
        if (!name || !email || !password || !password_confirmation) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({
                status: "failed",
                message: "Password and Confirm Password don't match",
            })
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ status: "failed", message: "Email already exists" })
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        })
        sendOTPMail(req, newUser);

        res.status(201).json({ status: "success", message: "Unable to register, Please try again later" });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to Register, Please try again later",
        });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ status: "success", message: "Email doesn't exists" });
        }

        if (existingUser.is_varified) {
            return res.status(400).json({ staus: "failed", message: "Email is already verified" });
        }
        const emailVerification = await otpModel.findOne({
            userId: existingUser._id,
            otp,
        })
        if (emailVerification) {
            const currentTime = new Date();
            const expireTime = new Date(
                emailVerification.createdAt.getTime() + 15 * 60 * 1000
            );

            if (currentTime > expireTime) {
                await sendOTPMail(req, existingUser)

                return res.status(400).json({ status: "failed", message: "OTP expired, new OPT sent to your email" })
            };
        }

        if (!emailVerification) {
            if (!existingUser.is_varified) {
                await sendOTPMail(req, existingUser);
                return res.status(400).json({ status: "failed", message: "Invalid OTP, new OTP sent to your email" })
            }

            return res.status(400).json({ status: "failed", message: "Invalid OTP" })
        }
        existingUser.is_varified = true;
        await existingUser.save();
        await otpModel.deleteMany({ userId: existingUser._id });

        return res.status(200).json({ status: "success", message: "Email verified successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to verify Email, Please try again later",
        });
    }
}

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status()
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ status: "failed", message: "Invalid email or password" })
        }
        if (!user.is_varified) {
            return res.status(400).json({ status: "failed", message: "Your account is not verified" });
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ status: "failed", message: "Invalid email or password" });
        }

        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);
        setTokenCookies(
            res,
            accessToken,
            refreshToken,
            accessTokenExp,
            refreshTokenExp
        )

        res.status(200).json({
            user: { userId: user._id, email: user.email, name: user.name },
            role: user.role,
            status: "success",
            message: "Login successfully",
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_exp: accessTokenExp,
            is_auth: true,
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to Login, Please try again later",
        });
    }
}

const getNewAccessToken = async (req, res) => {
    try {
        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await refreshAccessToken(req, res);
        setTokenCookies(
            res,
            accessToken,
            refreshToken,
            accessTokenExp,
            refreshTokenExp
        )
        res.status(200).send({
            status: "success",
            message: "New tokens generated",
            accessToken,
            refreshToken,
            accessTokenExp
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Invalid refreshToken, Please try again later",
        });
    }
}

const userProfile = async (req, res) => {
    res.send({ user: req.user })
}

const changePassword = async (req, res) => {
    try {
        const { password, password_confirmation } = req.body;
        if (!password || !password_confirmation) {
            return res.status(400).json({ staus: "failed", message: "All fields are required" })
        }

        if (password !== password_confirmation) {
            return res.status(400).json({
                status: "failed",
                message: "Password and Confirm password don't match",
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        await userModel.findByIdAndDelete(req.user._id, {
            $set: { password: hashedPassword }
        });

        res.status(201).json({ status: "success", message: "Password change successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to change password, Please try again later",
        });
    }
}

const sendPasswordResetEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: "failed", message: "All fields are require" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ staus: "failed", message: "Email doesn't exist" })
        }

        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_KEY, {
            expiresIn: "15m"
        })

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Password reset link",
            html: `<p>Dear ${user.name}</p>
                <p>click on this <a>http://localhost:5001/api/user/reset-password/${user._id}/${token}</a> link to reset password</p>`,
        })

        res.status(200).json({ status: "failed", message: "Unable to send an email, Please try again later" });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to send an email, Please try again later",
        });
    }
}

const passwordReset = async (req, res) => {
    try {
        const { id, token } = req.params;
        const user = await userModel.findById({ id });

        if (!user) {
            return res.status(404).json({ staus: "failed", message: "User not found" })
        }

        jwt.verify(token, process.env.ACCESS_KEY);

        const { password, password_confirmation } = req.body;
        if (!password || !password_confirmation) {
            return res.status(400).json({ status: "failed", message: "All fields are require" })
        }

        if (password != password_confirmation) {
            return res.status(400).json({ status: "failed", message: "Password and confirm password don't match" })
        }

        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);

        await userModel.findByIdAndUpdate(req.user._id, {
            $set: { password: hashedPassword }
        })

        res.status(201).json({ status: "success", message: "Password reset successfully" })

    } catch (error) {
        if (error.name == "TokenExpiredError") {
            return res.status(400).json({
                status: "failed",
                message: "Token Expired, please request new password reset link",
            });
        }

        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to reset password, Please try again later",
        });
    }
}

const userLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        await refreshTokenModel.findOneAndUpdate(
            { token: refreshToken },
            { $set: { blackListed: true } }
        )

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.clearCookie("is_auth");

        res.status(200).json({ status: "success", message: "Logout successfully" })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to logout, Please try again later",
        });
    }
}

// admin controllers
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({ role: { $ne: "admin" } })
        res.status(200).json({ status: "success", users: users })
    } catch (error) {
        console.log(error);
        res.status(404).json({
            status: "failed",
            message: "Something went wrong, user not found",
        });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" })
        }

        res.status(200).json({
            status: "success",
            message: "user found successfully",
            user: user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to find a user",
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if(!user){
            return res.status(404).json({ status: "failed", message: "User not found" })
        }

        await userModel.deleteOne(user);
        res.status(200).json({ status: "success", message: "User deleted successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "failed",
            message: "Unable to delete a user",
        });
    }
}

module.exports = {
    userRegistration,
    verifyEmail,
    userLogin,
    getNewAccessToken,
    userProfile,
    changePassword,
    sendPasswordResetEmail,
    passwordReset,
    userLogout,
    getAllUsers,
    getUserById,
    deleteUser
}