// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
   const [firstLetter, setFirstLetter] = useState('');

 useEffect(() => {
    const email = localStorage.getItem('email');
    if (email && typeof email === 'string') {
      setFirstLetter(email.charAt(0).toUpperCase());
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstLetter');
    setFirstLetter(null); 
    navigate('/login');
  };
  const isLoggedIn = !!localStorage.getItem('token');
  
  


  return (
    <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 1 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{
              mr: 2,
              fontWeight: 'bold',
              color: 'green',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Shopcart
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: 2 }}>                      
              <Button color="inherit" onClick={() => navigate('/create')}>
                Create Product
              </Button>
              <Button color="inherit" onClick={() => navigate('/products')}>
                My Products
              </Button>
              <Button color="error" variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
               <Avatar sx={{ bgcolor: 'green', color: 'white', fontWeight: 'bold' }}>
                {firstLetter}
              </Avatar>   
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
              <Button variant="contained" color="success" onClick={() => navigate('/login')}>
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
