import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI, {
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection error:", err.message);
    }
}

export default connectDB;
