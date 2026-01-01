// src/components/common/ActionButtons.jsx
import Icon from '../Icon';

function ActionButtons({ onEdit, onDelete, onAdd, onSave, onCancel }) {
  return (
    <div className="action-buttons">
      {onAdd && (
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="add" /> Add New
        </button>
      )}
      
      {onEdit && (
        <button className="btn btn-secondary" onClick={onEdit}>
          <Icon name="edit" /> Edit
        </button>
      )}
      
      {onDelete && (
        <button className="btn btn-danger" onClick={onDelete}>
          <Icon name="delete" /> Delete
        </button>
      )}
      
      {onSave && (
        <button className="btn btn-success" onClick={onSave}>
          <Icon name="save" /> Save
        </button>
      )}
      
      {onCancel && (
        <button className="btn btn-light" onClick={onCancel}>
          <Icon name="cancel" /> Cancel
        </button>
      )}
    </div>
  );
}