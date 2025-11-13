// src/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// ✅ Fetch products (with filters and pagination)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ filters = {}, page = 1, limit = 3 }, { rejectWithValue }) => {
    try {
      const res = await API.get("/api/product/filter", {
        params: { ...filters, page, limit },
      });
      return res.data; // { data: [...], meta: { totalPages } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
    }
  }
);

// ✅ Create product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post("/api/product/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create product");
    }
  }
);

// ✅ Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/api/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update product");
    }
  }
);

// ✅ Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/api/product/${id}`);
      return id; // return deleted product ID
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalPages = action.payload.meta.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })

      // DELETE
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export default productSlice.reducer;
