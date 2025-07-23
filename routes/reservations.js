
const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).send("Access denied");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const newReservation = new Reservation({ ...req.body, user: req.user.id });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { site, date } = req.query;
    const query = {};
    if (site) query.site = site;
    if (date) query.date = date;
    const reservations = await Reservation.find(query).populate("user", "username");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
