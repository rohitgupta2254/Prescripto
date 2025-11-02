import React from 'react';
import { formatTime } from '../../utils/helpers';
import '../../styles/Patient.css';

const SlotSelector = ({ slots, selectedSlot, onSelectSlot, error }) => {
  if (slots.length === 0) {
    return <div className="no-slots">No available slots for selected date</div>;
  }

  return (
    <div className="slot-selector">
      <div className={`slots-grid ${error ? 'error' : ''}`}>
        {slots.map(slot => (
          <button
            key={slot}
            type="button"
            className={`slot-button ${selectedSlot === slot ? 'selected' : ''}`}
            onClick={() => onSelectSlot(slot)}
          >
            {formatTime(slot)}
          </button>
        ))}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};

export default SlotSelector;