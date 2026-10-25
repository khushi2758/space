import History from "../models/history.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

function getUserIdFromRequest(req) {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;
        if (!token) return null;
        const decoded = jwt.verify(token, config.JWT_SECRET);
        return decoded.id;
    } catch {
        return null;
    }
}

export async function addHistory(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        const {
            asteroidId,
            asteroidName,
            diameterKm,
            velocityKmh,
            missDistanceKm,
            isHazardous,
            habitabilityScore,
            isNewEarthCandidate
        } = req.body;

        if (!asteroidId || !asteroidName) {
            return res.status(400).json({
                success: false,
                message: "Asteroid ID and Name are required"
            });
        }

        const entry = await History.create({
            userId: userId || null,
            asteroidId,
            asteroidName,
            diameterKm: Number(diameterKm) || 0,
            velocityKmh: Number(velocityKmh) || 0,
            missDistanceKm: Number(missDistanceKm) || 0,
            isHazardous: Boolean(isHazardous),
            habitabilityScore: Number(habitabilityScore) || 0,
            isNewEarthCandidate: Boolean(isNewEarthCandidate),
            searchedAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "History recorded successfully",
            history: entry
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to record history",
            error: error.message
        });
    }
}

export async function getHistory(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        const query = userId ? { userId } : {};

        let list = await History.find(query)
            .sort({ searchedAt: -1 })
            .limit(50);

        if (list.length === 0) {
            const seedItems = [
                {
                    asteroidId: "2000433",
                    asteroidName: "433 Eros",
                    diameterKm: 16.8,
                    velocityKmh: 20016,
                    missDistanceKm: 26630000,
                    isHazardous: false,
                    habitabilityScore: 78,
                    isNewEarthCandidate: true,
                    searchedAt: new Date(Date.now() - 3600000 * 2)
                },
                {
                    asteroidId: "3542519",
                    asteroidName: "2010 PK9",
                    diameterKm: 0.26,
                    velocityKmh: 65880,
                    missDistanceKm: 7330000,
                    isHazardous: true,
                    habitabilityScore: 28,
                    isNewEarthCandidate: false,
                    searchedAt: new Date(Date.now() - 3600000 * 5)
                },
                {
                    asteroidId: "2099942",
                    asteroidName: "99942 Apophis",
                    diameterKm: 0.37,
                    velocityKmh: 26748,
                    missDistanceKm: 3740000,
                    isHazardous: true,
                    habitabilityScore: 62,
                    isNewEarthCandidate: false,
                    searchedAt: new Date(Date.now() - 86400000)
                }
            ];
            await History.insertMany(seedItems);
            list = await History.find(query).sort({ searchedAt: -1 }).limit(50);
        }

        const groupedMap = new Map();

        list.forEach(item => {
            const dateObj = new Date(item.searchedAt);
            const dateStr = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            const timeStr = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

            if (!groupedMap.has(dateStr)) {
                groupedMap.set(dateStr, {
                    date: dateStr,
                    status: item.isHazardous ? "Overtime" : item.isNewEarthCandidate ? "Done" : "In Progress",
                    tasks: []
                });
            }

            groupedMap.get(dateStr).tasks.push({
                title: `${item.asteroidName} (${item.isNewEarthCandidate ? "Candidate" : item.isHazardous ? "PHA" : "Normal"} - Score: ${item.habitabilityScore}%)`,
                time: timeStr
            });
        });

        const groupedHistory = Array.from(groupedMap.values());

        return res.status(200).json({
            success: true,
            count: list.length,
            history: list,
            groupedHistory
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch history",
            error: error.message
        });
    }
}

export async function clearHistory(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (userId) {
            await History.deleteMany({ userId });
        } else {
            await History.deleteMany({});
        }

        return res.status(200).json({
            success: true,
            message: "History cleared successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to clear history",
            error: error.message
        });
    }
}
