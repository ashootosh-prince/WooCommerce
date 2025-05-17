import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Alert,
} from '@mui/material';

const CreateProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!product.name.trim()) newErrors.name = 'Name is required';
    if (!product.description.trim()) newErrors.description = 'Description is required';
    if (!product.price) newErrors.price = 'Price is required';
    else if (isNaN(product.price) || Number(product.price) <= 0)
      newErrors.price = 'Price must be a positive number';

    if (product.imageUrl && !isValidUrl(product.imageUrl))
      newErrors.imageUrl = 'Invalid URL';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setMessage('All field are required.');
      setSuccess(false);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/products', product, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('Product created and syncing...');
      setSuccess(true);
      setProduct({ name: '', description: '', price: '', imageUrl: '' });
      setErrors({});
    } catch (err) {
      setMessage('Failed to create product.');
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Create Product
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description}
            required
          />
          <TextField
            fullWidth
            label="Price"
            margin="normal"
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            error={!!errors.price}
            helperText={errors.price}
            required
          />
          <TextField
            fullWidth
            label="Image URL"
            margin="normal"
            value={product.imageUrl}
            onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
            error={!!errors.imageUrl}
            helperText={errors.imageUrl}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Create Product
          </Button>
          {message && (
            <Alert severity={success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProduct;
