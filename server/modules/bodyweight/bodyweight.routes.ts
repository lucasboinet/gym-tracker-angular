import { Router } from "express";
import authenticated from "../../middleware/authenticated";
import { createEntry, deleteEntry, getEntries } from "./bodyweight.controller";

const router: Router = Router();

router.get("/", authenticated, getEntries);
router.post("/", authenticated, createEntry);
router.delete("/:id", authenticated, deleteEntry);

export default router;
