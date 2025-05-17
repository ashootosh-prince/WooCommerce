import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const CARD_HEIGHT = 350;
const IMAGE_HEIGHT = 160;
const CONTENT_HEIGHT = 180;
const BUTTONS_HEIGHT = 60;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProducts();
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert("Unauthorized permission: You cannot delete this product.");
      } else {
        console.error("Error deleting product:", err);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/products/${editingProduct}`,
        form,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert("Unauthorized permission: You cannot update this product.");
      } else {
        console.error("Error updating product:", err);
      }
    }
  };

  return (
    <Container sx={{ mt: 10, mb: 4, ml: 14 }}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card
              sx={{
                height: CARD_HEIGHT,
                width: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              {editingProduct === product._id ? (
                <CardContent
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    paddingBottom: 2,
                  }}
                >
                  <Stack spacing={1}>
                    <TextField
                      size="small"
                      label="Name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                    <TextField
                      size="small"
                      label="Description"
                      multiline
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                    <TextField
                      size="small"
                      label="Price"
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                    <TextField
                      size="small"
                      label="Image URL"
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                    />
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleUpdate}
                      >
                        Update
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              ) : (
                <>
                  <CardMedia
                    component="img"
                    image={
                      product.imageUrl ||
                      "https://t3.ftcdn.net/jpg/05/04/28/96/360_F_504289605_zehJiK0tCuZLP2MdfFBpcJdOVxKLnXg1.jpg"
                    }
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: IMAGE_HEIGHT,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <CardContent
                    sx={{
                      height: CONTENT_HEIGHT,
                      overflow: "hidden",
                      paddingBottom: 0,
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      variant="subtitle1"
                      noWrap
                      title={product.name}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={product.description}
                    >
                      {product.description}
                    </Typography>
                    <Typography variant="body1" mt={1} fontWeight="bold">
                      &#x20B9;{product.price}
                    </Typography>
                  </CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      height: BUTTONS_HEIGHT,
                      alignItems: "center",
                      px: 2,
                      pb: 2,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;
