import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  const handleRegister = () => {
    dispatch(registerUser({ name, email, password }));
  };

  // Redirect if registration is successful
  useEffect(() => {
    if (user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <Box
      sx={{
        width: 300,
        margin: "100px auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h5" mb={2}>
        Register
      </Typography>
      <TextField
        fullWidth
        label="Name"
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </Button>
      <Typography sx={{ mt: 2 }}>
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Box>
  );
};

export default Register;
