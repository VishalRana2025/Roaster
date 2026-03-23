const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Client = require("./models/Client");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/trackitDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

// test route
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// ================== API ROUTES ==================

// ✅ CREATE
app.post("/add-client", async (req, res) => {
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
app.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching clients" });
  }
});

// ✅ UPDATE
app.put("/update-client/:id", async (req, res) => {
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
app.delete("/delete-client/:id", async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
});

// ================== START SERVER ==================
const PORT = 5001; // 🔥 changed port (fix for EADDRINUSE)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});