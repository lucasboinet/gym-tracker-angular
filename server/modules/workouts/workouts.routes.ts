import { Router } from "express";
import authenticated from "../../middleware/authenticated";
import {
  clearCurrentWorkout,
  createWorkout,
  deleteWorkout,
  getCurrentWorkout,
  getWorkouts,
  getWorkoutsStats,
  saveWorkout,
  updateCurrentWorkout,
} from "./workouts.controller";

const router: Router = Router();

router.get("/", authenticated, getWorkouts);
router.get("/stats", authenticated, getWorkoutsStats);
router.put("/", authenticated, saveWorkout);
router.post("/", authenticated, createWorkout);
router.delete("/:id", authenticated, deleteWorkout);
router.get("/active", authenticated, getCurrentWorkout);
router.post("/active", authenticated, updateCurrentWorkout);
router.delete("/active", authenticated, clearCurrentWorkout);

export default router;
