import React from 'react';

const CategoryFilter = ({ categories = [], selectedCategory, onSelectCategory }) => {
  // console.log('CategoryFilter received categories:', categories);
  return (
    <div className="category-filter">
      <h4>Categories</h4>
      <div className="category-list">
        <button 
          className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSelectCategory(null)}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;