const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Client = require("./models/Client");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection (use ENV variable)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// test route
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// ================== API ROUTES ==================

// ✅ CREATE
app.post("/api/add-client", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json({ message: "Client saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving client" });
  }
});

// ✅ GET ALL
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching clients" });
  }
});

// ✅ UPDATE
app.put("/api/update-client/:id", async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating client" });
  }
});

// ✅ DELETE
app.delete("/api/delete-client/:id", async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
});

// ================== START SERVER ==================

// ✅ IMPORTANT for Render
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});