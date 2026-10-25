import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    asteroidId: {
        type: String,
        required: true
    },
    asteroidName: {
        type: String,
        required: true
    },
    diameterKm: {
        type: Number,
        default: 0
    },
    velocityKmh: {
        type: Number,
        default: 0
    },
    missDistanceKm: {
        type: Number,
        default: 0
    },
    isHazardous: {
        type: Boolean,
        default: false
    },
    habitabilityScore: {
        type: Number,
        default: 0
    },
    isNewEarthCandidate: {
        type: Boolean,
        default: false
    },
    searchedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("History", historySchema);
