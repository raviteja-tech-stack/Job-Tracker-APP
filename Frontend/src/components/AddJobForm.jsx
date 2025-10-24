import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function AddJobForm({ onJobAdded, editJob, clearEdit }) {
  const [job, setJob] = useState({
    company: "",
    position: "",
    status: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (editJob) {
      setJob({
        company: editJob.company,
        position: editJob.position,
        status: editJob.status,
      });
    }
  }, [editJob]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sendRequest = async () => {
    const token = localStorage.getItem("token");
    if (!job.company || !job.position || !job.status) {
      setSnackbar({
        open: true,
        message: "All fields are required!",
        severity: "error",
      });
      return;
    }

    try {
      if (editJob) {
        await axios.put(`http://localhost:3000/jobs/${editJob._id}`, job, {
          headers: { Authorization: `Bearer ${token}` },
        });
        clearEdit();
        setSnackbar({
          open: true,
          message: "Job updated successfully!",
          severity: "success",
        });
      } else {
        await axios.post("http://localhost:3000/jobs", job, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Job added successfully!",
          severity: "success",
        });
      }
      setJob({ company: "", position: "", status: "" });
      onJobAdded();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Something went wrong!",
        severity: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendRequest();
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Card sx={{ width: { xs: "90%", sm: 400 } }}>
        <CardContent>
          <Typography variant="h6" mb={2} align="center">
            {editJob ? "Edit Job" : "Add Job"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Company"
                name="company"
                value={job.company}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Position"
                name="position"
                value={job.position}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                select
                label="Status"
                name="status"
                value={job.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="interview">Interview</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="selected">Selected</MenuItem>
              </TextField>
              <Box display="flex" justifyContent="space-between">
                <Button variant="contained" color="primary" type="submit">
                  {editJob ? "Update" : "Add"}
                </Button>
                {editJob && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={clearEdit}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
