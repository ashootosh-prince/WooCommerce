import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Register from './component/Register';
import Login from './component/Login';
import CreateProduct from './component/CreateProduct';
import ProductList from './component/ProductList';
import Navbar from './Navbar';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if(token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}, [token]);

const handleLogout = () => {
  setToken('');
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};


  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        {/* <nav style={{ marginBottom: '20px' }}>
          {token ? (
            <>
              <Link to="/create">Create Product</Link> |{' '}
              <Link to="/products">My Products</Link> |{' '}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link> |{' '}
              <Link to="/login">Login</Link>
            </>
          )}
        </nav> */}
        <Navbar/>

        <Routes>
          <Route path="/" element={<Navigate to={token ? '/products' : '/login'} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route
            path="/create"
            element={token ? <CreateProduct /> : <Navigate to="/login" />}
          />
          <Route
            path="/products"
            element={token ? <ProductList /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
