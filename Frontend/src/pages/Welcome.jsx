import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
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
          maxWidth: 500,
          boxShadow: 6,
          borderRadius: 3,
          p: 4,
          textAlign: "center",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}
          >
            Welcome to Job Tracker
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Track your job applications easily. Login if you already have an
            account, or sign up to get started.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              fullWidth
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/signup"
              variant="outlined"
              size="large"
              fullWidth
            >
              Sign Up
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
