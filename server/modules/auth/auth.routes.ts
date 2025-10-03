import { Router } from "express";
import authenticated from "../../middleware/authenticated";
import {
  getProfile,
  login,
  logout,
  refreshToken,
  register,
} from "./auth.controller";

const router: Router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/token/refresh", refreshToken);
router.post("/logout", authenticated, logout);
router.get("/me", authenticated, getProfile);

export default router;
