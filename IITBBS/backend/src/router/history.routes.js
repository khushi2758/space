import { Router } from "express";
import * as historyController from "../controllers/history.controller.js";

const historyRouter = Router();

historyRouter.post("/", historyController.addHistory);
historyRouter.get("/", historyController.getHistory);
historyRouter.delete("/", historyController.clearHistory);

export default historyRouter;
