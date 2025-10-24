import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddJob from "../components/AddJobForm";
import * as React from "react";
import Pagination from "@mui/material/Pagination";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { Add, Logout, Edit, Delete } from "@mui/icons-material";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [addJob, setAddJob] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("all");
  const [company, setCompany] = useState("all");
  const [search, setSearch] = useState("all");
  const [sort, setSort] = useState("latest");
  const [totalJobs, setTotalJobs] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.PROD
    ? "https://job-tracker-app-uely.onrender.com"
    : "http://localhost:3000";

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchTerm.trim() === "" ? "all" : searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch welcome message
  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMessage(response.data.message);
      } catch (err) {
        console.log("Token invalid or server error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessage();
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = {
        page,
        limit,
        sort,
        ...(status !== "all" && { status }),
        ...(company !== "all" && { company }),
        ...(search !== "all" && { search }),
      };

      const res = await axios.get(`${BASE_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setJobs(res.data.jobs);
      setTotalJobs(res.data.totalJobs);
      setPage(res.data.currentPage);
      setLimit(res.data.limit);

      // Dynamic filters
      setCompanies([...new Set(res.data.jobs.map((job) => job.company))]);
      setPositions([...new Set(res.data.jobs.map((job) => job.position))]);
    } catch (err) {
      console.log("Error fetching jobs", err);
    }
  }, [status, company, search, page, limit, sort]);

  // Delete job
  const deleteJob = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs();
    } catch (err) {
      console.log("Error deleting job", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => setPage(1), [status, company]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Job Tracker
          </Typography>
          <Box>
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => setAddJob(!addJob)}
            >
              {addJob ? "Close Form" : "Add Job"}
            </Button>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box sx={{ flex: 1, px: 3, py: 3 }}>
        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : (
          <Typography variant="h6" align="center" gutterBottom>
            {message}
          </Typography>
        )}

        <Typography variant="h5" align="center" gutterBottom fontWeight={600}>
          Your Jobs
        </Typography>

        {/* Filters */}
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={2}
          mt={2}
          mb={3}
        >
          <FormControl sx={{ minWidth: 160 }} size="small" variant="outlined">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="interview">Interview</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="selected">Selected</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }} size="small" variant="outlined">
            <InputLabel id="company-label">Company</InputLabel>
            <Select
              labelId="company-label"
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {companies.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Search Position"
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FormControl sx={{ minWidth: 160 }} size="small" variant="outlined">
            <InputLabel id="sort-label">Sort</InputLabel>
            <Select
              labelId="sort-label"
              label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="a-z">Company A–Z</MenuItem>
              <MenuItem value="z-a">Company Z–A</MenuItem>
              <MenuItem value="oldest">Old to New</MenuItem>
              <MenuItem value="latest">New to Old</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Add Job Form */}
        {addJob && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <AddJob
              onJobAdded={fetchJobs}
              editJob={editJob}
              clearEdit={() => {
                setEditJob(null);
                setAddJob(false);
              }}
            />
          </Box>
        )}

        {/* Jobs Grid */}
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {jobs.length === 0 ? (
            <Typography
              variant="h6"
              align="center"
              sx={{ width: "100%", mt: 4 }}
            >
              No jobs found
            </Typography>
          ) : (
            jobs.map((job) => (
              <Grid
                key={job._id}
                sx={{
                  display: "flex",
                  flex: "1 1 100%",
                  "@media (min-width:600px)": { flex: "1 1 48%" },
                  "@media (min-width:900px)": { flex: "1 1 23%" },
                  minWidth: 250,
                }}
              >
                <Card
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 220,
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{ fontWeight: 600 }}
                    >
                      {job.company}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      align="center"
                      sx={{ mt: 1 }}
                    >
                      Position: {job.position}
                    </Typography>
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Chip
                        label={job.status.toUpperCase()}
                        sx={{
                          bgcolor:
                            job.status === "pending"
                              ? "warning.main"
                              : job.status === "interview"
                              ? "primary.main"
                              : job.status === "rejected"
                              ? "error.main"
                              : "success.main",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => {
                        setEditJob(job);
                        setAddJob(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => deleteJob(job._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Pagination */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={4}
          mb={4}
          flexDirection="column"
          gap={2}
        >
          <FormControl sx={{ minWidth: 150 }} size="small" variant="outlined">
            <InputLabel id="limit-label">Jobs per page</InputLabel>
            <Select
              labelId="limit-label"
              label="Jobs per page"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 20, 50].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {totalJobs > 0 && (
            <>
              <Pagination
                count={Math.ceil(totalJobs / limit)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="large"
                sx={{ "& .MuiPaginationItem-root": { fontSize: "1rem" } }}
              />
              <Typography variant="body1" color="text.secondary">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, totalJobs)} of {totalJobs} jobs
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
