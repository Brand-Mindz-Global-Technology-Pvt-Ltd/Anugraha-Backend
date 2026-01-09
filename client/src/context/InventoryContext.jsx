import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const InventoryContext = createContext();
const INVENTORY_API = import.meta.env.VITE_API_URL;

export function InventoryProvider({ children }) {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 5;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`${INVENTORY_API}/inventory/products`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
          category: filterCategory,
          status: filterStatus,
        },
      });
      if (res.success) {
        setData(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalProducts(res.pagination.totalProducts);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data: res } = await axios.get(`${INVENTORY_API}/inventory/getcategory`);
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error("Category error:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const value = {
    data, loading, categories, searchTerm, setSearchTerm,
    filterCategory, setFilterCategory, filterStatus, setFilterStatus,
    currentPage, setCurrentPage, totalPages, totalProducts, fetchProducts
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

// Custom Hook for easy access
export const useInventory = () => useContext(InventoryContext);