import React, { useState, useEffect } from 'react';

interface TextModalProps {
  defaultValue: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

const TextModal: React.FC<TextModalProps> = ({ defaultValue, onSave, onCancel }) => {
  const [text, setText] = useState(defaultValue);

  useEffect(() => {
    setText(defaultValue);
  }, [defaultValue]);

  const handleSave = () => {
    onSave(text);
  };

  return (
    <div className="modal d-block position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Text</h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <textarea
              className="form-control"
              rows={3}
              value={text}
              autoFocus
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSave(); e.preventDefault(); } }}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!text.trim()}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextModal;
