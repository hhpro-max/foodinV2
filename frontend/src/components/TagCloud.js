import React from 'react';

const TagCloud = ({ tags, selectedTags, onToggleTag }) => {
  return (
    <div className="tag-cloud">
      <h4>Popular Tags</h4>
      <div className="tags">
        {tags.map(tag => (
          <button
            key={tag.id}
            className={`tag ${selectedTags.includes(tag.id) ? 'active' : ''}`}
            onClick={() => onToggleTag(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;