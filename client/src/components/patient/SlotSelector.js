import React from 'react';
import { formatTime } from '../../utils/helpers';
import '../../styles/Patient.css';

// allSlots: full list for the day (e.g., generated from timing start/end)
// availableSlots: subset of allSlots that are currently free
const SlotSelector = ({ allSlots = [], availableSlots = [], selectedSlot, onSelectSlot, error }) => {
  if ((!allSlots || allSlots.length === 0) && (!availableSlots || availableSlots.length === 0)) {
    return <div className="no-slots">No available slots for selected date</div>;
  }

  // If only availableSlots provided, show those
  const slotsToRender = (allSlots && allSlots.length > 0) ? allSlots : availableSlots;

  return (
    <div className="slot-selector">
      <div className={`slots-grid ${error ? 'error' : ''}`}>
        {slotsToRender.map(slot => {
          const isAvailable = availableSlots.includes(slot);
          return (
            <button
              key={slot}
              type="button"
              className={`slot-button ${selectedSlot === slot ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
              onClick={() => isAvailable && onSelectSlot(slot)}
              disabled={!isAvailable}
              aria-disabled={!isAvailable}
            >
              {formatTime(slot)}
            </button>
          );
        })}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};

export default SlotSelector;