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
      toast.error('بارگذاری دسته‌بندی‌ها با خطا مواجه شد.');
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
      toast.error('نام دسته‌بندی الزامی است.');
      return;
    }
    try {
      await createCategory({ name: newCategoryName });
      toast.success('دسته‌بندی با موفقیت ایجاد شد.');
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      toast.error('ایجاد دسته‌بندی با خطا مواجه شد.');
      console.error(error);
    }
  };

  const handleUpdate = async (categoryId, name) => {
    try {
      await updateCategory(categoryId, { name });
      toast.success('دسته‌بندی با موفقیت به‌روزرسانی شد.');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('به‌روزرسانی دسته‌بندی با خطا مواجه شد.');
      console.error(error);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      toast.success('دسته‌بندی با موفقیت حذف شد.');
      fetchCategories();
    } catch (error) {
      toast.error('حذف دسته‌بندی با خطا مواجه شد.');
      console.error(error);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div>
      <h2>مدیریت دسته‌بندی‌ها</h2>
      <div>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="نام دسته‌بندی جدید"
        />
        <button onClick={handleCreate}>ایجاد</button>
      </div>
      <table className="panel-table">
        <thead>
          <tr>
            <th>شناسه</th>
            <th>نام</th>
            <th>اقدامات</th>
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
                <button onClick={() => setEditingCategory(category.id)}>ویرایش</button>
                <button onClick={() => handleDelete(category.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManagement;