import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Wiki home page");
});

router.get("/about", (req, res) => {
  res.send("About this wiki");
});

export default router;
