import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/blogs`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchAdminBlogs = async () => {
  const { data } = await axios.get(`${API}/admin`, { headers: authHeaders() });
  return data.data;
};

export const createBlog = async (formData) => {
  const { data } = await axios.post(`${API}/admin`, formData, {
    headers: authHeaders(),
  });
  return data.data;
};

export const updateBlog = async (id, formData) => {
  const { data } = await axios.put(`${API}/admin/${id}`, formData, {
    headers: authHeaders(),
  });
  return data.data;
};

export const updateBlogStatus = async (id, status) => {
  const { data } = await axios.patch(
    `${API}/admin/${id}/status`,
    { status },
    { headers: authHeaders() }
  );
  return data.data;
};

export const deleteBlog = async (id) => {
  await axios.delete(`${API}/admin/${id}`, { headers: authHeaders() });
};
