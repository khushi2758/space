import { Router } from "express";
import * as asteroidController from "../controllers/asteroid.controller.js";

const asteroidRouter = Router();

asteroidRouter.get("/feed", asteroidController.getAsteroidFeed);
asteroidRouter.get("/closest", asteroidController.getClosestApproaches);
asteroidRouter.get("/hazardous", asteroidController.getHazardousAsteroids);
asteroidRouter.get("/new-earth-candidates", asteroidController.getNewEarthCandidates);
asteroidRouter.get("/summary", asteroidController.getSummaryStats);
asteroidRouter.get("/alerts", asteroidController.getAlerts);
asteroidRouter.get("/:id", asteroidController.getAsteroidById);
asteroidRouter.post("/predict", asteroidController.predictHabitability);

export default asteroidRouter;
