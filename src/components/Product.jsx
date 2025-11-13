import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Avatar,
  IconButton,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../redux/slices/productSlice";

const Products = () => {
  const dispatch = useDispatch();
  const { items: products, totalPages, loading, error } = useSelector(
    (state) => state.products
  );

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", description: "", InStock: true });
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [filters, setFilters] = useState({ name: "", InStock: "", startDate: "" });
  const [sort, setSort] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const savedFilters = sessionStorage.getItem("productFilters");
    const savedSort = sessionStorage.getItem("productSort");
    if (savedFilters) setFilters(JSON.parse(savedFilters));
    if (savedSort) setSort(savedSort);

    dispatch(fetchProducts({ filters: JSON.parse(savedFilters || "{}"), page: 1 }));
  }, [dispatch]);

  const applySort = (productsArray, sortValue) => {
    const arr = [...productsArray];
    switch (sortValue) {
      case "newest":
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "nameAsc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "nameDesc":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return arr;
    }
  };

  const handleSortChange = (value) => {
    setSort(value);
    sessionStorage.setItem("productSort", value);
  };

  const handleFilter = () => {
    setPage(1);
    sessionStorage.setItem("productFilters", JSON.stringify(filters));
    dispatch(fetchProducts({ filters, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ name: "", InStock: "", startDate: "" });
    setSort("");
    setPage(1);
    sessionStorage.removeItem("productFilters");
    sessionStorage.removeItem("productSort");
    dispatch(fetchProducts({ filters: {}, page: 1 }));
  };

  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      payload.append("description", formData.description || "");
      payload.append("InStock", formData.InStock ? "true" : "false");

      if (existingImages.length > 0) {
        payload.append("existingImages", JSON.stringify(existingImages));
      }

      images.forEach((file) => payload.append("images", file));

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, formData: payload }));
      } else {
        await dispatch(createProduct(payload));
      }

      dispatch(fetchProducts({ filters, page }));
      handleClose();
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteProduct(id));
    dispatch(fetchProducts({ filters, page }));
  };

  const handleOpen = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || "",
        InStock: product.InStock,
      });
      setExistingImages(product.images || []);
      setImages([]);
    } else {
      setFormData({ name: "", price: "", description: "", InStock: true });
      setImages([]);
      setExistingImages([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setImages([]);
    setExistingImages([]);
  };

  const handleRemoveExistingImage = (imgPath) => {
    setExistingImages((prev) => prev.filter((img) => img !== imgPath));
  };
  const handleRemoveNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const displayedProducts = applySort(products, sort);

  return (
    <Container>
      <h1>Product List</h1>
      <Button variant="contained" color="secondary" onClick={() => handleOpen()}>
        Add Product
      </Button>

      {/* Filters and Sort */}
      <Box display="flex" gap={2} mt={2} mb={2} alignItems="center">
        <TextField
          label="Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.InStock === "true"}
              onChange={(e) =>
                setFilters({ ...filters, InStock: e.target.checked ? "true" : "false" })
              }
            />
          }
          label="In Stock"
        />
        <Button variant="contained" color="secondary" onClick={handleFilter}>
          Apply Filters
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleReset}>
          Reset
        </Button>

        <TextField
          select
          label="Sort By"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 150 }}
        >
          <option value=""></option>
          <option value="newest">Newest</option>
          <option value="nameAsc">Name A → Z</option>
          <option value="nameDesc">Name Z → A</option>
        </TextField>
      </Box>

      {/* Error */}
      {(error || errorMessage) && (
        <Box mt={2} mb={2} color="red">
          {error || errorMessage}
        </Box>
      )}

      {/* Loading */}
      {loading && <Box mt={2}>Loading products...</Box>}

      {/* Product Table */}
      {!loading && (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>In Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {product.images?.map((img, idx) => (
                        <Avatar
                          key={idx}
                          src={`${import.meta.env.VITE_BACKEND_URL}${img}`}
                          variant="square"
                          sx={{ width: 48, height: 48 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{product.InStock ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button color="primary" onClick={() => handleOpen(product)}>
                      <EditIcon />
                    </Button>
                    <IconButton color="error" onClick={() => handleDelete(product._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <Box mt={2} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="outlined"
          disabled={page <= 1}
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            dispatch(fetchProducts({ filters, page: newPage }));
          }}
        >
          Previous
        </Button>
        <Box display="flex" alignItems="center">
          Page {page} of {totalPages}
        </Box>
        <Button
          variant="outlined"
          disabled={page >= totalPages}
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            dispatch(fetchProducts({ filters, page: newPage }));
          }}
        >
          Next
        </Button>
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.InStock}
                onChange={(e) => setFormData({ ...formData, InStock: e.target.checked })}
              />
            }
            label="In Stock"
          />
          <Box mt={2}>
            <input type="file" multiple onChange={(e) => setImages([...e.target.files])} />
          </Box>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {existingImages.map((img, idx) => (
                <Box key={idx} position="relative" display="inline-block">
                  <Avatar
                    src={`${import.meta.env.VITE_BACKEND_URL}${img}`}
                    variant="square"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Tooltip title="Remove image">
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ position: "absolute", top: -8, right: -8, backgroundColor: "white" }}
                      onClick={() => handleRemoveExistingImage(img)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}

          {/* New Images */}
          {images.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {images.map((file, idx) => (
                <Box key={idx} position="relative" display="inline-block">
                  <Avatar
                    src={URL.createObjectURL(file)}
                    variant="square"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Tooltip title="Remove new image">
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ position: "absolute", top: -8, right: -8, backgroundColor: "white" }}
                      onClick={() => handleRemoveNewImage(idx)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">
            {editingProduct ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;
