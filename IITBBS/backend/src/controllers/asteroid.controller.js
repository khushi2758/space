import config from "../config/config.js";
import History from "../models/history.model.js";

const NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1";

const cacheStore = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key) {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_TTL_MS) {
        cacheStore.delete(key);
        return null;
    }
    return item.data;
}

function setCached(key, data) {
    if (cacheStore.size > 200) {
        const oldestKey = cacheStore.keys().next().value;
        cacheStore.delete(oldestKey);
    }
    cacheStore.set(key, { data, timestamp: Date.now() });
}

function calculateOrbitalMechanics(asteroid) {
    const approach = asteroid.close_approach_data?.[0];
    const vRel = approach ? parseFloat(approach.relative_velocity?.kilometers_per_second || "20") : 20;
    const missKm = approach ? parseFloat(approach.miss_distance?.kilometers || "5000000") : 5000000;

    const earthEscapeVel = 11.2;
    const deltaV = Math.sqrt(vRel * vRel + earthEscapeVel * earthEscapeVel) - earthEscapeVel;
    const transferDays = Math.max(15, Math.round((missKm / 2000000) * 12));

    const diameterKm = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0.5;
    const volumeKm3 = (4 / 3) * Math.PI * Math.pow(diameterKm / 2, 3);
    const density = 2.5e12;
    const massKg = volumeKm3 * density;

    const estimatedPlatinumTonnes = Math.round(massKg * 0.000015 / 1000);
    const estimatedWaterTonnes = Math.round(massKg * 0.08 / 1000);
    const resourceValueBillionUsd = Math.round((estimatedPlatinumTonnes * 0.035) + (estimatedWaterTonnes * 0.0005) + (diameterKm * 5));

    return {
        deltaVRequiredKps: Number(deltaV.toFixed(2)),
        estimatedTransferDays: transferDays,
        estimatedMassKg: massKg.toExponential(2),
        miningPotential: {
            platinumTonnes: estimatedPlatinumTonnes,
            waterTonnes: estimatedWaterTonnes,
            estimatedValueBillionUSD: Math.max(1, resourceValueBillionUsd)
        }
    };
}

function calculateNewEarthScore(asteroid) {
    let score = 50;
    const reasons = [];

    const diameterMin = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
    const diameterMax = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
    const avgDiameter = (diameterMin + diameterMax) / 2;

    if (avgDiameter >= 0.5 && avgDiameter <= 15) {
        score += 20;
        reasons.push("Substantial mass suitable for colonization/resource extraction");
    } else if (avgDiameter < 0.1) {
        score -= 25;
        reasons.push("Too small to sustain artificial gravity or atmosphere");
    } else {
        score += 5;
    }

    const approach = asteroid.close_approach_data?.[0];
    const velocityKps = approach ? parseFloat(approach.relative_velocity?.kilometers_per_second || "0") : 20;

    if (velocityKps >= 10 && velocityKps <= 28) {
        score += 15;
        reasons.push("Stable relative orbital velocity");
    } else if (velocityKps > 35) {
        score -= 15;
        reasons.push("High relative velocity creates severe kinetic risks");
    }

    const missAu = approach ? parseFloat(approach.miss_distance?.astronomical || "1") : 1;
    if (missAu >= 0.05 && missAu <= 0.3) {
        score += 15;
        reasons.push("Optimal proximity to Earth's orbital corridor");
    } else if (missAu < 0.02) {
        score -= 20;
        reasons.push("Excessively close approach posing direct impact trajectory");
    }

    if (asteroid.is_potentially_hazardous_asteroid) {
        score -= 20;
        reasons.push("Classified as Potentially Hazardous Asteroid (PHA)");
    } else {
        score += 10;
        reasons.push("Non-hazardous orbit trajectory");
    }

    const eccentricity = asteroid.orbital_data?.eccentricity ? parseFloat(asteroid.orbital_data.eccentricity) : 0.15;
    if (eccentricity < 0.2) {
        score += 10;
        reasons.push("Low eccentricity indicates circular, stable orbit");
    } else if (eccentricity > 0.5) {
        score -= 15;
        reasons.push("High orbital eccentricity causes severe climate extremes");
    }

    score = Math.max(5, Math.min(98, Math.round(score)));
    const isNewEarthCandidate = score >= 70;

    let riskLevel = "Low";
    if (asteroid.is_potentially_hazardous_asteroid || score < 30) {
        riskLevel = "High";
    } else if (score < 60) {
        riskLevel = "Moderate";
    }

    const mechanics = calculateOrbitalMechanics(asteroid);

    return {
        habitabilityScore: score,
        isNewEarthCandidate,
        riskLevel,
        assessmentSummary: isNewEarthCandidate
            ? "Favorable orbital and physical characteristics qualify this body as a New Earth research candidate."
            : "Does not meet the physical and orbital criteria required for a sustainable New Earth habitat.",
        factors: reasons,
        mechanics
    };
}

function getFallbackAsteroids(dateStr) {
    return [
        {
            id: "2000433",
            name: "433 Eros (1898 DQ)",
            nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2000433",
            absolute_magnitude_h: 11.16,
            estimated_diameter: {
                kilometers: { estimated_diameter_min: 16.8, estimated_diameter_max: 37.6 },
                meters: { estimated_diameter_min: 16800, estimated_diameter_max: 37600 }
            },
            is_potentially_hazardous_asteroid: false,
            close_approach_data: [{
                close_approach_date: dateStr,
                close_approach_date_full: `${dateStr} 14:22`,
                epoch_date_close_approach: Date.now(),
                relative_velocity: {
                    kilometers_per_second: "5.56",
                    kilometers_per_hour: "20016",
                    miles_per_hour: "12437"
                },
                miss_distance: {
                    astronomical: "0.178",
                    lunar: "69.3",
                    kilometers: "26630000",
                    miles: "16547000"
                },
                orbiting_body: "Earth"
            }],
            orbital_data: {
                orbit_id: "657",
                orbit_determination_date: "2024-01-01",
                first_observation_date: "1898-08-15",
                last_observation_date: "2024-06-20",
                orbital_period: 643.2,
                eccentricity: 0.223,
                inclination: 10.83,
                aphelion_distance: 1.78,
                perihelion_distance: 1.13
            }
        },
        {
            id: "3542519",
            name: "(2010 PK9)",
            nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3542519",
            absolute_magnitude_h: 21.6,
            estimated_diameter: {
                kilometers: { estimated_diameter_min: 0.12, estimated_diameter_max: 0.28 },
                meters: { estimated_diameter_min: 120, estimated_diameter_max: 280 }
            },
            is_potentially_hazardous_asteroid: true,
            close_approach_data: [{
                close_approach_date: dateStr,
                close_approach_date_full: `${dateStr} 18:40`,
                epoch_date_close_approach: Date.now(),
                relative_velocity: {
                    kilometers_per_second: "18.3",
                    kilometers_per_hour: "65880",
                    miles_per_hour: "40935"
                },
                miss_distance: {
                    astronomical: "0.049",
                    lunar: "19.1",
                    kilometers: "7330000",
                    miles: "4554000"
                },
                orbiting_body: "Earth"
            }],
            orbital_data: {
                orbit_id: "44",
                orbit_determination_date: "2023-10-12",
                first_observation_date: "2010-08-05",
                last_observation_date: "2023-09-18",
                orbital_period: 402.1,
                eccentricity: 0.187,
                inclination: 8.4,
                aphelion_distance: 1.26,
                perihelion_distance: 0.86
            }
        },
        {
            id: "2099942",
            name: "99942 Apophis (2004 MN4)",
            nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2099942",
            absolute_magnitude_h: 19.7,
            estimated_diameter: {
                kilometers: { estimated_diameter_min: 0.34, estimated_diameter_max: 0.45 },
                meters: { estimated_diameter_min: 340, estimated_diameter_max: 450 }
            },
            is_potentially_hazardous_asteroid: true,
            close_approach_data: [{
                close_approach_date: dateStr,
                close_approach_date_full: `${dateStr} 21:05`,
                epoch_date_close_approach: Date.now(),
                relative_velocity: {
                    kilometers_per_second: "7.43",
                    kilometers_per_hour: "26748",
                    miles_per_hour: "16620"
                },
                miss_distance: {
                    astronomical: "0.025",
                    lunar: "9.7",
                    kilometers: "3740000",
                    miles: "2324000"
                },
                orbiting_body: "Earth"
            }],
            orbital_data: {
                orbit_id: "212",
                orbit_determination_date: "2024-03-10",
                first_observation_date: "2004-03-15",
                last_observation_date: "2024-04-01",
                orbital_period: 323.6,
                eccentricity: 0.191,
                inclination: 3.33,
                aphelion_distance: 1.09,
                perihelion_distance: 0.74
            }
        }
    ];
}

async function fetchFromNasaWithFallback(startDate, endDate) {
    const cacheKey = `feed_${startDate}_${endDate}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const url = `${NASA_BASE_URL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${config.NASA_API_KEY}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const list = Object.values(data.near_earth_objects || {}).flat();
            if (list.length > 0) {
                setCached(cacheKey, list);
                return list;
            }
        }
    } catch (err) {
        console.warn("NASA API request issue, serving resilient dataset:", err.message);
    }

    const fallbackList = getFallbackAsteroids(startDate);
    setCached(cacheKey, fallbackList);
    return fallbackList;
}

export async function getAsteroidFeed(req, res) {
    try {
        const { date, startDate, endDate, sort, filter } = req.query;
        const today = new Date().toISOString().split("T")[0];
        const start = startDate || date || today;
        const end = endDate || start;

        const rawList = await fetchFromNasaWithFallback(start, end);

        let enrichedList = rawList.map((ast) => {
            const prediction = calculateNewEarthScore(ast);
            return {
                id: ast.id,
                name: ast.name,
                nasa_jpl_url: ast.nasa_jpl_url || "",
                absolute_magnitude_h: ast.absolute_magnitude_h,
                estimated_diameter: ast.estimated_diameter,
                is_potentially_hazardous_asteroid: ast.is_potentially_hazardous_asteroid,
                close_approach_data: ast.close_approach_data || [],
                orbital_data: ast.orbital_data,
                prediction
            };
        });

        if (filter === "hazardous") {
            enrichedList = enrichedList.filter(a => a.is_potentially_hazardous_asteroid);
        } else if (filter === "newEarth") {
            enrichedList = enrichedList.filter(a => a.prediction.isNewEarthCandidate);
        }

        if (sort === "diameter") {
            enrichedList.sort((a, b) => {
                const dA = a.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
                const dB = b.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
                return dB - dA;
            });
        } else if (sort === "velocity") {
            enrichedList.sort((a, b) => {
                const vA = parseFloat(a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0");
                const vB = parseFloat(b.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0");
                return vB - vA;
            });
        } else if (sort === "score") {
            enrichedList.sort((a, b) => b.prediction.habitabilityScore - a.prediction.habitabilityScore);
        } else if (sort === "distance") {
            enrichedList.sort((a, b) => {
                const distA = parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || "999999999");
                const distB = parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || "999999999");
                return distA - distB;
            });
        }

        const hazardousCount = enrichedList.filter(a => a.is_potentially_hazardous_asteroid).length;
        const newEarthCount = enrichedList.filter(a => a.prediction.isNewEarthCandidate).length;
        const avgDiameter = enrichedList.length
            ? enrichedList.reduce((sum, a) => {
                const min = a.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
                const max = a.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
                return sum + (min + max) / 2;
            }, 0) / enrichedList.length
            : 0;

        return res.status(200).json({
            success: true,
            date: start,
            count: enrichedList.length,
            stats: {
                totalCount: enrichedList.length,
                hazardousCount,
                newEarthCandidateCount: newEarthCount,
                averageDiameterKm: Number(avgDiameter.toFixed(3))
            },
            asteroids: enrichedList
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to process asteroid feed",
            error: error.message
        });
    }
}

export async function getClosestApproaches(req, res) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const rawList = await fetchFromNasaWithFallback(today, today);

        const sorted = rawList
            .filter(a => a.close_approach_data && a.close_approach_data.length > 0)
            .sort((a, b) => {
                const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
                const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
                return distA - distB;
            })
            .slice(0, 10)
            .map(ast => ({
                ...ast,
                prediction: calculateNewEarthScore(ast)
            }));

        return res.status(200).json({
            success: true,
            count: sorted.length,
            asteroids: sorted
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch closest approaches",
            error: error.message
        });
    }
}

export async function getHazardousAsteroids(req, res) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const rawList = await fetchFromNasaWithFallback(today, today);

        const hazardous = rawList
            .filter(a => a.is_potentially_hazardous_asteroid)
            .slice(0, 10)
            .map(ast => ({
                ...ast,
                prediction: calculateNewEarthScore(ast)
            }));

        return res.status(200).json({
            success: true,
            count: hazardous.length,
            asteroids: hazardous
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch hazardous asteroids",
            error: error.message
        });
    }
}

export async function getNewEarthCandidates(req, res) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const rawList = await fetchFromNasaWithFallback(today, today);

        const candidates = rawList
            .map(ast => ({
                ...ast,
                prediction: calculateNewEarthScore(ast)
            }))
            .filter(ast => ast.prediction.isNewEarthCandidate)
            .sort((a, b) => b.prediction.habitabilityScore - a.prediction.habitabilityScore);

        return res.status(200).json({
            success: true,
            count: candidates.length,
            candidates
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch New Earth candidates",
            error: error.message
        });
    }
}

export async function getAsteroidById(req, res) {
    try {
        const { id } = req.params;
        const cacheKey = `neo_${id}`;
        let ast = getCached(cacheKey);

        if (!ast) {
            try {
                const url = `${NASA_BASE_URL}/neo/${id}?api_key=${config.NASA_API_KEY}`;
                const response = await fetch(url);
                if (response.ok) {
                    ast = await response.json();
                    setCached(cacheKey, ast);
                }
            } catch (fetchErr) {
                console.warn("Direct lookup warning:", fetchErr.message);
            }
        }

        if (!ast) {
            const today = new Date().toISOString().split("T")[0];
            const fallbackList = getFallbackAsteroids(today);
            ast = fallbackList.find(a => a.id === id) || fallbackList[0];
        }

        const prediction = calculateNewEarthScore(ast);

        try {
            await History.create({
                asteroidId: ast.id,
                asteroidName: ast.name,
                diameterKm: ast.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
                velocityKmh: parseFloat(ast.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || "0"),
                missDistanceKm: parseFloat(ast.close_approach_data?.[0]?.miss_distance?.kilometers || "0"),
                isHazardous: Boolean(ast.is_potentially_hazardous_asteroid),
                habitabilityScore: prediction.habitabilityScore,
                isNewEarthCandidate: prediction.isNewEarthCandidate,
                searchedAt: new Date()
            });
        } catch {}

        return res.status(200).json({
            success: true,
            asteroid: {
                ...ast,
                prediction
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving asteroid",
            error: error.message
        });
    }
}

export async function predictHabitability(req, res) {
    try {
        const asteroidData = req.body;
        if (!asteroidData || !asteroidData.name) {
            return res.status(400).json({
                success: false,
                message: "Asteroid parameters required"
            });
        }

        const prediction = calculateNewEarthScore(asteroidData);

        return res.status(200).json({
            success: true,
            asteroidId: asteroidData.id || "simulation",
            asteroidName: asteroidData.name,
            prediction
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Prediction calculation failed",
            error: error.message
        });
    }
}

export async function getAlerts(req, res) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const rawList = await fetchFromNasaWithFallback(today, today);

        const alerts = rawList
            .filter(ast => ast.is_potentially_hazardous_asteroid || parseFloat(ast.close_approach_data?.[0]?.miss_distance?.astronomical || "1") < 0.08)
            .map((ast) => {
                const approach = ast.close_approach_data?.[0];
                const missKm = approach?.miss_distance?.kilometers ? Number(approach.miss_distance.kilometers).toLocaleString() : "N/A";
                const isCrit = ast.is_potentially_hazardous_asteroid && parseFloat(approach?.miss_distance?.astronomical || "1") < 0.05;

                return {
                    id: ast.id,
                    title: ast.name,
                    date: approach?.close_approach_date || "TODAY",
                    time: approach?.close_approach_date_full?.split(" ")[1] || "17:00",
                    severity: isCrit ? "CRITICAL" : "ADVISORY",
                    diameterKm: ast.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
                    velocityKmh: approach?.relative_velocity?.kilometers_per_hour || "N/A",
                    missDistanceKm: approach?.miss_distance?.kilometers || "N/A",
                    description: `Close encounter alert: Asteroid ${ast.name} passing at a miss distance of ${missKm} km with relative velocity of ${Math.round(parseFloat(approach?.relative_velocity?.kilometers_per_hour || "0")).toLocaleString()} km/h.`
                };
            });

        return res.status(200).json({
            success: true,
            count: alerts.length,
            alerts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch alerts",
            error: error.message
        });
    }
}

export async function getSummaryStats(req, res) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const rawList = await fetchFromNasaWithFallback(today, today);

        const total = rawList.length;
        const hazardous = rawList.filter(a => a.is_potentially_hazardous_asteroid).length;
        const candidates = rawList.map(calculateNewEarthScore).filter(p => p.isNewEarthCandidate).length;

        let fastestVelocity = 0;
        let closestDistance = Infinity;

        rawList.forEach(a => {
            const v = parseFloat(a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0");
            const d = parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || "Infinity");
            if (v > fastestVelocity) fastestVelocity = v;
            if (d < closestDistance) closestDistance = d;
        });

        return res.status(200).json({
            success: true,
            summary: {
                totalObjectsTracked: total,
                potentiallyHazardousCount: hazardous,
                newEarthCandidatesCount: candidates,
                fastestVelocityKps: Number(fastestVelocity.toFixed(2)),
                closestApproachKm: closestDistance === Infinity ? 0 : Math.round(closestDistance)
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate summary statistics",
            error: error.message
        });
    }
}
