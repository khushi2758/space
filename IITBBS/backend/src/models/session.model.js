import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    refreshTokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' },
    ip: {
        type: String,
        default: 'unknown'
    },
    userAgent: {
        type: String,
        default: 'unknown'
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const sessionModel = mongoose.model('session', sessionSchema);

export default sessionModel;
