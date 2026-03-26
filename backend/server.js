const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Client = require("./models/Client");

const app = express();

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

// ================== ROUTES ==================

// Test route
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// ✅ CREATE CLIENT
app.post("/api/add-client", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();

    res.status(201).json({
      message: "Client saved successfully",
      data: client,
    });
  } catch (error) {
    console.error("❌ Error saving client:", error);
    res.status(500).json({
      message: "Error saving client",
      error: error.message,
    });
  }
});

// ✅ GET ALL CLIENTS
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error("❌ Error fetching clients:", error);
    res.status(500).json({
      message: "Error fetching clients",
      error: error.message,
    });
  }
});

// ✅ UPDATE CLIENT
app.put("/api/update-client/:id", async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating client:", error);
    res.status(500).json({
      message: "Error updating client",
      error: error.message,
    });
  }
});

// ✅ DELETE CLIENT
app.delete("/api/delete-client/:id", async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting client:", error);
    res.status(500).json({
      message: "Error deleting client",
      error: error.message,
    });
  }
});

// ================== START SERVER ==================

const PORT = process.env.PORT || 5000;

// ✅ Start server ONLY after DB connects
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
  });