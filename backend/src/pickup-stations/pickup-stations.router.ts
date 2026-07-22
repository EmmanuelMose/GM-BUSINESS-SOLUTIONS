import { Router } from "express";
import {
  getAllStationsController,
  getActiveStationsController,
  getStationByIdController,
  createStationController,
  updateStationController,
  deleteStationController,
  toggleStationStatusController,
  getLocationsByStationController,
  getLocationByIdController,
  createLocationController,
  updateLocationController,
  deleteLocationController,
  toggleLocationStatusController
} from "./pickup-stations.controller";

const pickupStationsRouter = Router();

pickupStationsRouter.get("/", getAllStationsController);
pickupStationsRouter.get("/active", getActiveStationsController);
pickupStationsRouter.get("/:id", getStationByIdController);
pickupStationsRouter.post("/", createStationController);
pickupStationsRouter.put("/:id", updateStationController);
pickupStationsRouter.delete("/:id", deleteStationController);
pickupStationsRouter.patch("/:id/toggle-status", toggleStationStatusController);

pickupStationsRouter.get("/:stationId/locations", getLocationsByStationController);
pickupStationsRouter.get("/locations/:id", getLocationByIdController);
pickupStationsRouter.post("/locations", createLocationController);
pickupStationsRouter.put("/locations/:id", updateLocationController);
pickupStationsRouter.delete("/locations/:id", deleteLocationController);
pickupStationsRouter.patch("/locations/:id/toggle-status", toggleLocationStatusController);

export default pickupStationsRouter;