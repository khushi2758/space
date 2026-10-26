import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { sendEmail } from "../service/email.service.js";
import sessionModel from "../models/session.model.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../models/otp.js";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            verified: false
        });

        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

        await otpModel.deleteMany({ email });

        await otpModel.create({
            email,
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendEmail(
            email,
            "Verify your email address",
            `Your OTP is ${otp}. It expires in 10 minutes.`,
            html
        );

        return res.status(201).json({
            message: "User registered successfully. Please verify your OTP.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            },
            otp
        });
    } catch (error) {
        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        if (hashedPassword !== user.password) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.verified) {
            user.verified = true;
            await user.save();
        }

        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        await sessionModel.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip || "unknown",
            userAgent: req.headers["user-agent"] || "unknown"
        });

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            },
            accessToken
        });
    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message,
            
        });

    }
}

export async function getMe(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.startsWith("Bearer "))
            ? authHeader.split(" ")[1]
            : (req.cookies?.accessToken || req.cookies?.refreshToken);

        if (!token) {
            return res.status(401).json({
                message: "Authentication token not found"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired session",
            error: error.message
        });
    }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const session = await sessionModel.findOne({
            userId: decoded.id,
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: "Session expired or revoked"
            });
        }

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        session.refreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
        await session.save();

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken
        });
    } catch (error) {
        return res.status(401).json({
            message: "Unable to refresh token",
            error: error.message
        });
    }
}

export async function logout(req, res) {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
            await sessionModel.findOneAndUpdate(
                { refreshTokenHash, revoked: false },
                { revoked: true }
            );
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Logout failed",
            error: error.message
        });
    }
}

export async function logoutAll(req, res) {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            await sessionModel.updateMany({ userId: decoded.id, revoked: false }, { revoked: true });
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "Logged out from all sessions successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Logout all failed",
            error: error.message
        });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

        const otpDoc = await otpModel.findOne({
            email,
            otpHash,
            expiresAt: { $gt: new Date() }
        });

        let user;
        if (!otpDoc) {
            user = await userModel.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    message: "Invalid or expired OTP"
                });
            }
        } else {
            user = await userModel.findById(otpDoc.user);
        }

        if (user) {
            user.verified = true;
            await user.save();
        }

        await otpModel.deleteMany({ email });

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        await sessionModel.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip || "unknown",
            userAgent: req.headers["user-agent"] || "unknown"
        });

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: true
            },
            accessToken
        });
    } catch (error) {
        return res.status(500).json({
            message: "Email verification failed",
            error: error.message
        });
    }
}

export async function resendOtp(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await otpModel.deleteMany({ email });

        const otp = generateOtp();
        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
        const html = getOtpHtml(otp);

        await otpModel.create({
            email,
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendEmail(
            email,
            "Your new verification OTP",
            `Your new OTP is ${otp}. It expires in 10 minutes.`,
            html
        );

        return res.status(200).json({
            message: "A new OTP has been sent to your email",
            otp
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to resend OTP",
            error: error.message
        });
    }
}
