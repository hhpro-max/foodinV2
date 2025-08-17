import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error('Failed to fetch categories.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategoryName) {
      toast.error('Category name is required.');
      return;
    }
    try {
      await createCategory({ name: newCategoryName });
      toast.success('Category created successfully.');
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to create category.');
      console.error(error);
    }
  };

  const handleUpdate = async (categoryId, name) => {
    try {
      await updateCategory(categoryId, { name });
      toast.success('Category updated successfully.');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category.');
      console.error(error);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      toast.success('Category deleted successfully.');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category.');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Category Management</h2>
      <div>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
        />
        <button onClick={handleCreate}>Create</button>
      </div>
      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>
                {editingCategory === category.id ? (
                  <input
                    type="text"
                    defaultValue={category.name}
                    onBlur={(e) => handleUpdate(category.id, e.target.value)}
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                <button onClick={() => setEditingCategory(category.id)}>Edit</button>
                <button onClick={() => handleDelete(category.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManagement;