import { Router } from "express";
import authenticated from "../../middleware/authenticated";
import {
  deleteSetting,
  getUsersSetting,
  saveSetting,
} from "./settings.controller";

const router: Router = Router();

router.get("/", authenticated, getUsersSetting);
router.post("/", authenticated, saveSetting);
router.delete("/:id", authenticated, deleteSetting);

export default router;
