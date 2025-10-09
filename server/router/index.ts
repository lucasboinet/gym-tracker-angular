import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import sessionsRoutes from "../modules/sessions/sessions.routes";
import settingsRoutes from "../modules/settings/settings.routes";
import workoutsRoutes from "../modules/workouts/workouts.routes";

const router: Router = Router();

router.use("/workouts", workoutsRoutes);
router.use("/settings", settingsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/auth", authRoutes);

export default router;
