const mongoose = require("mongoose");
const Job = require("../Models/job.js");
const { data } = require("./data.js");

main()
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/JobTrackerApp");
}

const companies = ["Google", "Amazon", "Facebook", "Microsoft", "Apple"];
const positions = [
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Developer",
  "Data Analyst",
  "QA Tester",
];
const statuses = ["pending", "interview", "rejected"];
const userId = "68e533009d8c7e9bb66ff155"; // replace with a valid user id

// generate 50 random jobs
let dataToInsert = Array.from({ length: 50 }, () => ({
  company: companies[Math.floor(Math.random() * companies.length)],
  position: positions[Math.floor(Math.random() * positions.length)],
  status: statuses[Math.floor(Math.random() * statuses.length)],
  createdBy: userId,
}));

const initData = async () => {
  await Job.deleteMany({});
  await Job.insertMany(dataToInsert);
  console.log("Data was initialized");
};

initData();
