import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Plus, X, Trash2, Clock, MapPin, Calendar, CheckSquare, Check, RotateCcw } from 'lucide-react';

// 定義可用的顏色選項
const COLOR_OPTIONS = [
  { name: 'Blue', value: 'bg-blue-100 border-blue-300 text-blue-800', bg: 'bg-blue-100' },
  { name: 'Green', value: 'bg-green-100 border-green-300 text-green-800', bg: 'bg-green-100' },
  { name: 'Purple', value: 'bg-purple-100 border-purple-300 text-purple-800', bg: 'bg-purple-100' },
  { name: 'Yellow', value: 'bg-yellow-100 border-yellow-300 text-yellow-800', bg: 'bg-yellow-100' },
  { name: 'Red', value: 'bg-red-100 border-red-300 text-red-800', bg: 'bg-red-100' },
  { name: 'Indigo', value: 'bg-indigo-100 border-indigo-300 text-indigo-800', bg: 'bg-indigo-100' },
  { name: 'Pink', value: 'bg-pink-100 border-pink-300 text-pink-800', bg: 'bg-pink-100' },
  { name: 'Orange', value: 'bg-orange-100 border-orange-300 text-orange-800', bg: 'bg-orange-100' },
  { name: 'Teal', value: 'bg-teal-100 border-teal-300 text-teal-800', bg: 'bg-teal-100' },
  { name: 'Gray', value: 'bg-gray-100 border-gray-300 text-gray-800', bg: 'bg-gray-100' },
];

// 初始課程數據
const INITIAL_EVENTS = [
  { id: '1', subject: 'IT226L', description: 'ADV.DATABASE MGT SYSTEM LAB', day: 'Wednesday', start: '14:00', end: '17:00', room: 'TBA', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: '2', subject: 'IT226', description: 'ADV.DATABASE MGT SYSTEM LEC', day: 'Tuesday', start: '15:00', end: '16:00', room: 'SV311', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: '3', subject: 'IT226', description: 'ADV.DATABASE MGT SYSTEM LEC', day: 'Thursday', start: '15:00', end: '16:00', room: 'SV311', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: '4', subject: 'CM215L', description: 'APPLIED CHEMISTRY FOR IT LAB', day: 'Friday', start: '10:30', end: '13:30', room: 'OZ403', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: '5', subject: 'CM215', description: 'APPLIED CHEMISTRY FOR IT LEC', day: 'Tuesday', start: '13:00', end: '14:00', room: 'SV203', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: '6', subject: 'CM215', description: 'APPLIED CHEMISTRY FOR IT LEC', day: 'Thursday', start: '13:00', end: '14:00', room: 'SV203', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: '7', subject: 'PH114', description: 'ETHICS', day: 'Monday', start: '18:00', end: '19:00', room: 'ST126', color: 'bg-purple-100 border-purple-300 text-purple-800' },
];

// 修改 DAYS 包含週末
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 7;
const END_HOUR = 22;

// 輔助函數：時間轉換
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTime12H = (time) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
};

const App = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [isContinuous, setIsContinuous] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  const scheduleRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('mySchedule');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  const saveSchedule = () => {
    localStorage.setItem('mySchedule', JSON.stringify(events));
    alert('Saved successfully');
  };

  const exportSchedule = () => {
    window.print();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      const newEvents = events.filter(e => e.id !== id);
      setEvents(newEvents);
      localStorage.setItem('mySchedule', JSON.stringify(newEvents));
      setIsModalOpen(false);
    }
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const baseEventData = {
      subject: formData.get('subject'),
      description: formData.get('description'),
      room: formData.get('room'),
      start: formData.get('start'),
      end: formData.get('end'),
      color: selectedColor,
    };

    let updatedEvents = [...events];

    if (editingEvent) {
        updatedEvents = updatedEvents.filter(ev => ev.id !== editingEvent.id);
    }

    if (isContinuous) {
        if (selectedDays.length === 0) {
            alert("Please select at least one day.");
            return;
        }

        const newEvents = selectedDays.map((day, index) => ({
            id: Date.now().toString() + index,
            day: day,
            ...baseEventData
        }));

        updatedEvents = [...updatedEvents, ...newEvents];

    } else {
        const newEvent = {
            id: editingEvent ? editingEvent.id : Date.now().toString(),
            day: formData.get('day'),
            ...baseEventData
        };
        updatedEvents.push(newEvent);
    }

    setEvents(updatedEvents);
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    setIsContinuous(false); 
    setSelectedDays(['Monday']); 
    setSelectedColor(COLOR_OPTIONS[0].value); 
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setIsContinuous(false); 
    setSelectedDays([event.day]); 
    setSelectedColor(event.color || COLOR_OPTIONS[0].value); 
    setIsModalOpen(true);
  };

  // 修改：清空所有數據
  const resetSchedule = () => {
      if(window.confirm("Are you sure you want to clear all data? This operation cannot be undone.")) {
          setEvents([]); // 清空數據
          localStorage.removeItem('mySchedule');
      }
  }

  const toggleDay = (day) => {
      if (selectedDays.includes(day)) {
          setSelectedDays(selectedDays.filter(d => d !== day));
      } else {
          setSelectedDays([...selectedDays, day]);
      }
  };

  // 動態計算 Grid 的樣式，因為列數變多了
  const gridStyle = {
      display: 'grid',
      // 第一欄是時間 (80px)，後面 7 欄均分
      gridTemplateColumns: '80px repeat(7, 1fr)' 
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans print:bg-white print:p-0">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center print:hidden">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-blue-600"/> 
                My Weekly Schedule 
            </h1>
            <p className="text-gray-500 mt-1"> Weekly Schedule APP - create by <a href="https://github.com/dukehug">Duke</a>  & Gemini &  ❤️ </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button onClick={openNewEventModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition">
            <Plus size={18} /> Add New
          </button>
          <button onClick={saveSchedule} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition">
            <Save size={18} /> Save Setings
          </button>
          <button onClick={exportSchedule} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow transition">
            <Download size={18} /> Print
          </button>
           <button onClick={resetSchedule} className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-200 transition shadow-sm">
            <RotateCcw size={18} /> Empty
          </button>
        </div>
      </div>

      {/* Main Schedule Grid */}
      <div className="max-w-full mx-auto bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none print:w-full" ref={scheduleRef}>
        <div className="overflow-x-auto">
          {/* 增加 min-w 以容納 7 天 */}
          <div className="min-w-[1000px] relative">
            
            {/* Header Row (Days) */}
            <div style={gridStyle} className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <div className="p-4 border-r border-gray-200 text-center text-gray-400 font-medium text-sm flex items-center justify-center">
                Time / Day
              </div>
              {DAYS.map(day => (
                <div key={day} className="p-4 text-center border-r border-gray-200 font-bold text-gray-700 uppercase tracking-wider text-sm md:text-base">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="relative" style={gridStyle}>
              
              {/* Time Slots Background */}
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
                const hour = START_HOUR + i;
                return (
                  <React.Fragment key={hour}>
                    <div className="h-20 border-r border-b border-gray-100 text-xs text-gray-500 font-medium flex flex-col justify-start items-center pt-1 bg-gray-50/50">
                        <span>{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                    {DAYS.map((d, colIndex) => (
                      <div key={`${d}-${hour}`} className={`h-20 border-r border-b border-gray-100 ${colIndex === DAYS.length -1 ? 'border-r-0' : ''}`}></div>
                    ))}
                  </React.Fragment>
                );
              })}

              {/* Events Overlay */}
              {events.map((event) => {
                const dayIndex = DAYS.indexOf(event.day);
                if (dayIndex === -1) return null;

                const startMin = timeToMinutes(event.start);
                const endMin = timeToMinutes(event.end);
                const gridStartMin = START_HOUR * 60;
                
                const top = ((startMin - gridStartMin) / 60) * 80;
                const height = ((endMin - startMin) / 60) * 80;
                
                // 動態寬度計算：(100% - 80px) / 7
                // 動態 Left 計算：80px + (dayIndex * (100% - 80px) / 7)
                const totalColumns = DAYS.length; // 7

                return (
                  <div
                    key={event.id}
                    onClick={() => openEditModal(event)}
                    className={`absolute z-10 m-1 p-2 rounded-lg border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden leading-tight flex flex-col gap-1 ${event.color} hover:brightness-95 print:border`}
                    style={{
                      top: `${top}px`,
                      height: `${height - 2}px`,
                      left: `calc(80px + ${(dayIndex * 100) / totalColumns}% - ${(dayIndex * 80) / totalColumns}px + 2px)`,
                      width: `calc((100% - 80px) / ${totalColumns} - 4px)`
                    }}
                  >
                    <div className="font-bold text-sm truncate">{event.subject}</div>
                    <div className="opacity-90 truncate">{event.description}</div>
                    <div className="mt-auto flex flex-col gap-0.5 opacity-75 text-[10px]">
                        <div className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatTime12H(event.start)} - {formatTime12H(event.end)}
                        </div>
                         <div className="flex items-center gap-1">
                            <MapPin size={10} />
                            {event.room}
                        </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-white font-bold text-lg">
                    {editingEvent ? 'Edit Subject' : 'Add Subject'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              
              {/* Mode Selection */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Schedule Model：</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={!isContinuous} 
                        onChange={() => setIsContinuous(false)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Single</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={isContinuous} 
                        onChange={() => setIsContinuous(true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Continue</span>
                  </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course code</label>
                    <input name="subject" defaultValue={editingEvent?.subject} required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="e.g. IT226" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name / Description</label>
                    <input name="description" defaultValue={editingEvent?.description} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="e.g. ADV. DATABASE" />
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    
                    {!isContinuous ? (
                        // Single Mode: Dropdown
                        <select name="day" defaultValue={editingEvent?.day || 'Monday'} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    ) : (
                        // Continuous Mode: Checkboxes (Grid adjusted for 7 days might need smaller font or more columns)
                        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {DAYS.map(d => (
                                <label key={d} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                    <div 
                                        className={`w-4 h-4 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${selectedDays.includes(d) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                                        onClick={(e) => { e.preventDefault(); toggleDay(d); }}
                                    >
                                        {selectedDays.includes(d) && <CheckSquare size={12} className="text-white" />}
                                    </div>
                                    <span className="text-xs text-gray-700 truncate">{d}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Color Picker Section */}
                <div className="col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Subject Color</label>
                     <div className="flex flex-wrap gap-2">
                         {COLOR_OPTIONS.map((color) => (
                             <button
                                 key={color.name}
                                 type="button"
                                 onClick={() => setSelectedColor(color.value)}
                                 className={`w-8 h-8 rounded-full ${color.bg} border-2 flex items-center justify-center transition-all hover:scale-110 ${selectedColor === color.value ? 'border-gray-600 shadow-md ring-2 ring-blue-200' : 'border-transparent'}`}
                                 title={color.name}
                             >
                                 {selectedColor === color.value && <Check size={14} className="text-gray-700" />}
                             </button>
                         ))}
                     </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input name="room" defaultValue={editingEvent?.room} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. SV311" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                    <input type="time" name="start" defaultValue={editingEvent?.start || '08:00'} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                    <input type="time" name="end" defaultValue={editingEvent?.end || '09:00'} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                {editingEvent && (
                  <button type="button" onClick={() => handleDelete(editingEvent.id)} className="flex-1 flex justify-center items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium">
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button type="submit" className="flex-[2] flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-md">
                    <Save size={16} /> {editingEvent ? (isContinuous ? 'Update & Copy ' : 'Save') : 'New'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
            @page { size: landscape; margin: 0.5cm; }
            body { background: white; -webkit-print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:w-full { width: 100% !important; max-width: none !important; }
            .print\\:border { border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  );
};

export default App;