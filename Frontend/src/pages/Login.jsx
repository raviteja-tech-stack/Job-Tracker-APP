import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        formData
      );
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: "70%", md: "50%", lg: "35%" },
          boxShadow: 6,
          borderRadius: 3,
          p: 4,
          backgroundColor: "white",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            textAlign="center"
            sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}
          >
            Login to Job Tracker
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 1 }}
            >
              Login
            </Button>

            <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
              Don’t have an account?{" "}
              <Link
                to="/signup"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
