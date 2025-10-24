require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./Models/user.js");
const Job = require("./Models/job.js");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://job-tracker-app-uely.onrender.com/"
        : "http://localhost:5173",
    credentials: true,
  })
);

// JWT Auth Middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No Token Provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// PORT
const PORT = process.env.PORT || 3000;

// Routes

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashPassword = await bcryptjs.hash(password, 10);
    const user = new User({ name, email, password: hashPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (err) {
    res.status(500).json({ message: "Server Error. Try again later." });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found. Please signup first." });

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong Password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });
    res.status(200).json({ message: "Login Successful", user, token });
  } catch (err) {
    res.status(500).json({ message: "Server Error. Try again later." });
  }
});

// Dashboard
app.get("/dashboard", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ message: `Welcome, ${user.name}` });
});

// Jobs CRUD
app.get("/jobs", verifyToken, async (req, res) => {
  let query = { createdBy: req.user.id };
  const allowedStatuses = ["pending", "interview", "rejected", "selected"];
  const allowedCompanies = await Job.distinct("company");

  if (req.query.status && req.query.status !== "all") {
    const status = req.query.status.toLowerCase().trim();
    if (allowedStatuses.includes(status)) query.status = status;
  }

  if (req.query.company && req.query.company !== "all") {
    const company = req.query.company.toLowerCase().trim();
    if (allowedCompanies.map((c) => c.toLowerCase().trim()).includes(company)) {
      query.company = { $regex: company, $options: "i" };
    }
  }

  if (req.query.search && req.query.search !== "") {
    query.position = {
      $regex: req.query.search.toLowerCase().trim(),
      $options: "i",
    };
  }

  let sort = req.query.sort || "-company";
  if (sort === "a-z") sort = { company: 1 };
  if (sort === "z-a") sort = { company: -1 };
  if (sort === "latest") sort = { createdAt: -1 };
  if (sort === "oldest") sort = { createdAt: 1 };

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .collation({ locale: "en", strength: 2 })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);
  const totalPages = Math.ceil(totalJobs / limit);

  res
    .status(200)
    .json({ totalJobs, totalPages, limit, currentPage: page, jobs });
});

app.post("/jobs", verifyToken, async (req, res) => {
  const { company, position, status } = req.body;
  const newJob = new Job({ company, position, status, createdBy: req.user.id });
  await newJob.save();
  res.status(200).json({ message: "Job added", newJob });
});

app.put("/jobs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (req.user.id !== job.createdBy.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this job" });
  }

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );
  res.status(200).json({ message: "Updated job", updatedJob });
});

app.delete("/jobs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (req.user.id !== job.createdBy.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this job" });
  }

  await Job.findByIdAndDelete(id);
  res.status(200).json({ message: "Deleted job" });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "Frontend", "dist");

  // Serve all static files
  app.use(express.static(frontendPath));

  // SPA fallback for routes not handled by backend API
  app.use((req, res, next) => {
    // Only intercept GET requests that are not API calls
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    } else {
      next();
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
