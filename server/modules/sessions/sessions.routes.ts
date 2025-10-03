import { Router } from "express";
import authenticated from "../../middleware/authenticated";
import {
  createSession,
  deleteSession,
  getSessions,
  updateSession,
} from "./sessions.controller";

const router: Router = Router();

router.get("/", authenticated, getSessions);
router.post("/", authenticated, createSession);
router.put("/:id", authenticated, updateSession);
router.delete("/:id", authenticated, deleteSession);

export default router;
