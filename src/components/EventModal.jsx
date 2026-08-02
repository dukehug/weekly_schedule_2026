import { Check, CheckSquare, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { COLOR_OPTIONS, DAYS } from '../constants/schedule.js';
import ModalShell from './ModalShell.jsx';

const EventModal = ({ editingEvent, onClose, onDelete, onSave }) => {
  const [isContinuous, setIsContinuous] = useState(false);
  const [selectedDays, setSelectedDays] = useState([editingEvent?.day || 'Monday']);
  const [selectedColor, setSelectedColor] = useState(
    editingEvent?.color || COLOR_OPTIONS[0].value,
  );

  const toggleDay = (day) => {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter(currentDay => currentDay !== day);
      }
      return [...currentDays, day];
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isContinuous && selectedDays.length === 0) {
      window.alert('Please select at least one day.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const eventData = {
      subject: formData.get('subject'),
      description: formData.get('description'),
      room: formData.get('room'),
      start: formData.get('start'),
      end: formData.get('end'),
      color: selectedColor,
    };
    const eventDays = isContinuous ? selectedDays : [formData.get('day')];

    onSave({
      editingEvent,
      eventData,
      selectedDays: eventDays,
      isContinuous,
    });
    onClose();
  };

  return (
    <ModalShell title={editingEvent ? 'Edit Subject' : 'Add Subject'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="flex items-center gap-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <span className="text-sm font-medium text-gray-700">Schedule Mode:</span>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="mode" checked={!isContinuous} onChange={() => setIsContinuous(false)} className="accent-gray-900" />
            <span className="text-sm text-gray-600">Single</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="mode" checked={isContinuous} onChange={() => setIsContinuous(true)} className="accent-gray-900" />
            <span className="text-sm text-gray-600">Continue</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">Course code / Section</label>
            <input id="subject" name="subject" defaultValue={editingEvent?.subject} required className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-400" placeholder="e.g. IT226 or 29082" />
          </div>
          <div className="col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Subject Name / Description</label>
            <input id="description" name="description" defaultValue={editingEvent?.description} className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-400" placeholder="e.g. ADV. DATABASE" />
          </div>

          <div className="col-span-2">
            <label htmlFor="day" className="mb-1 block text-sm font-medium text-gray-700">Day</label>
            {!isContinuous ? (
              <select id="day" name="day" defaultValue={editingEvent?.day || 'Monday'} className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400">
                {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            ) : (
              <div className="grid grid-cols-3 gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                {DAYS.map(day => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      aria-pressed={isSelected}
                      className="flex items-center gap-2 rounded p-1 text-left hover:bg-gray-100"
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <CheckSquare size={12} className="text-white" />}
                      </span>
                      <span className="truncate text-xs text-gray-700">{day}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <fieldset className="col-span-2">
            <legend className="mb-2 block text-sm font-medium text-gray-700">Subject Color</legend>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${color.bg} transition-colors ${selectedColor === color.value ? 'border-gray-700 ring-2 ring-gray-200' : 'border-transparent'}`}
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.value}
                >
                  {selectedColor === color.value && <Check size={14} className="subject-color-check text-gray-700" />}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="col-span-2">
            <label htmlFor="room" className="mb-1 block text-sm font-medium text-gray-700">Room</label>
            <input id="room" name="room" defaultValue={editingEvent?.room} className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400" placeholder="e.g. SV311" />
          </div>
          <div>
            <label htmlFor="start" className="mb-1 block text-sm font-medium text-gray-700">Start time</label>
            <input id="start" type="time" name="start" defaultValue={editingEvent?.start || '08:00'} className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400" required />
          </div>
          <div>
            <label htmlFor="end" className="mb-1 block text-sm font-medium text-gray-700">End time</label>
            <input id="end" type="time" name="end" defaultValue={editingEvent?.end || '09:00'} className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400" required />
          </div>
        </div>

        <div className="mt-4 flex gap-3 border-t border-gray-100 pt-4">
          {editingEvent && (
            <button type="button" onClick={() => onDelete(editingEvent.id)} className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-50">
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button type="submit" className="flex flex-[2] items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800">
            <Save size={16} /> {editingEvent ? 'Save' : 'New'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default EventModal;
