import React, { useRef, useState } from 'react';
import { Save, Download, Plus, X, Trash2, Clock, MapPin, Calendar, CheckSquare, Check, RotateCcw, Upload, FileText, Smartphone, LoaderCircle } from 'lucide-react';
import { parseImportedSchedule } from './importSchedule';
import { exportSchedule } from './printSchedule';
import { trackEvent } from './analytics';

const LEGACY_GRAY_COLOR = 'bg-gray-100 border-gray-300 text-gray-800';
const SLATE_COLOR = 'bg-slate-200 border-slate-500 text-slate-900';

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
  { name: 'Slate', value: SLATE_COLOR, bg: 'bg-slate-300' },
];

// 初始課程數據
const INITIAL_EVENTS = [
  { id: '1', subject: 'IT226L', description: 'EXAMPLE COURSE', day: 'Wednesday', start: '14:00', end: '17:00', room: 'TBA', color: 'bg-blue-100 border-blue-300 text-blue-800' },
];

// 修改 DAYS 包含週末
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 80;

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

const loadInitialEvents = () => {
  try {
    const saved = localStorage.getItem('mySchedule');
    if (!saved) return INITIAL_EVENTS;

    const savedEvents = JSON.parse(saved);
    if (!Array.isArray(savedEvents)) return INITIAL_EVENTS;

    return savedEvents.map(event => (
      event.color === LEGACY_GRAY_COLOR
        ? { ...event, color: SLATE_COLOR }
        : event
    ));
  } catch {
    localStorage.removeItem('mySchedule');
    return INITIAL_EVENTS;
  }
};

const App = () => {
  const [events, setEvents] = useState(loadInitialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [printError, setPrintError] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [isContinuous, setIsContinuous] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const scheduleHeaderRef = useRef(null);

  const saveSchedule = () => {
    localStorage.setItem('mySchedule', JSON.stringify(events));
    trackEvent('save_schedule', { session_count: events.length });
    alert('Saved successfully');
  };

  const openPrintModal = () => {
    setPrintError('');
    setIsPrintModalOpen(true);
  };

  const closePrintModal = () => {
    if (isExporting) return;
    setIsPrintModalOpen(false);
    setPrintError('');
  };

  const handlePrint = async (format) => {
    setIsExporting(true);
    setPrintError('');

    try {
      await exportSchedule(format, events);
      trackEvent('export_schedule', {
        export_format: format,
        session_count: events.length,
      });
      setIsPrintModalOpen(false);
    } catch (error) {
      setPrintError(error instanceof Error ? error.message : 'Unable to export the schedule.');
    } finally {
      setIsExporting(false);
    }
  };

  const openImportModal = () => {
    setImportText('');
    setImportError('');
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportError('');
  };

  const handleImport = (e) => {
    e.preventDefault();

    try {
      const importedEvents = parseImportedSchedule(importText);
      setEvents(importedEvents);
      localStorage.setItem('mySchedule', JSON.stringify(importedEvents));
      trackEvent('import_schedule', { session_count: importedEvents.length });
      closeImportModal();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to import this data.');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      const newEvents = events.filter(e => e.id !== id);
      setEvents(newEvents);
      localStorage.setItem('mySchedule', JSON.stringify(newEvents));
      trackEvent('delete_class', { session_count: newEvents.length });
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
    trackEvent('save_class', {
      operation: editingEvent ? 'edit' : 'create',
      session_count: updatedEvents.length,
    });
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
          trackEvent('reset_schedule');
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

  const syncScheduleHeader = (event) => {
    if (scheduleHeaderRef.current) {
      scheduleHeaderRef.current.style.transform = `translateX(-${event.currentTarget.scrollLeft}px)`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-gray-900 print:bg-white print:p-0">
      
      {/* Header */}
      <div className="max-w-full mx-auto mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-gray-600"/>
                My Weekly Schedule 
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Plan your week at a glance. Start on  <a className="text-gray-700 underline underline-offset-2 hover:text-gray-950" href="https://github.com/dukehug/weekly_schedule_2026" target="_blank" >GitHub</a>.
            </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openNewEventModal} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-2 rounded-md border border-gray-900 transition-colors">
            <Plus size={18} /> Add New
          </button>
          <button onClick={openImportModal} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-md border border-gray-300 transition-colors">
            <Upload size={18} /> Import
          </button>
          <button onClick={saveSchedule} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-md border border-gray-300 transition-colors">
            <Save size={18} /> Save Settings
          </button>
          <button onClick={openPrintModal} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-md border border-gray-300 transition-colors">
            <Download size={18} /> Print
          </button>
           <button onClick={resetSchedule} className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 px-3.5 py-2 rounded-md border border-gray-300 hover:border-red-300 transition-colors">
            <RotateCcw size={18} /> Empty
          </button>
        </div>
      </div>

      {/* Main Schedule Grid */}
      <div className="max-w-full mx-auto bg-white rounded-lg border border-gray-200 shadow-sm print:shadow-none print:w-full">
        {/* Sticky Header Row (Days) */}
        <div className="sticky top-0 z-30 overflow-hidden rounded-t-lg bg-gray-50 shadow-[0_1px_0_0_#e5e7eb] print:static print:shadow-none">
          <div
            ref={scheduleHeaderRef}
            style={gridStyle}
            className="min-w-[1000px] bg-gray-50 will-change-transform"
          >
              <div className="p-4 border-r border-gray-200 text-center text-gray-400 font-medium text-sm flex items-center justify-center">
                Time / Day
              </div>
              {DAYS.map(day => (
                <div key={day} className="p-4 text-center border-r border-gray-200 font-semibold text-gray-700 text-sm">
                  {day}
                </div>
              ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-lg" onScroll={syncScheduleHeader}>
          {/* 增加 min-w 以容納 7 天 */}
          <div className="min-w-[1000px] relative">
            {/* Grid Body */}
            <div
              className="relative"
              style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
            >
              
              {/* Time Slots Background */}
              <div className="absolute inset-0" style={gridStyle}>
                {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
                  const hour = START_HOUR + i;
                  return (
                    <React.Fragment key={hour}>
                      <div
                        className="border-r border-b border-gray-100 text-xs text-gray-500 font-medium flex flex-col justify-start items-center pt-1 bg-gray-50/50"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      >
                          <span>{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
                      </div>
                      {DAYS.map((d, colIndex) => (
                        <div
                          key={`${d}-${hour}`}
                          className={`border-r border-b border-gray-100 ${colIndex === DAYS.length -1 ? 'border-r-0' : ''}`}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        ></div>
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Events Overlay */}
              {events.map((event) => {
                const dayIndex = DAYS.indexOf(event.day);
                if (dayIndex === -1) return null;

                const startMin = timeToMinutes(event.start);
                const endMin = timeToMinutes(event.end);
                const gridStartMin = START_HOUR * 60;
                const durationMinutes = endMin - startMin;
                const isTinyEvent = durationMinutes < 60;
                const isCompactEvent = durationMinutes >= 60 && durationMinutes < 120;
                
                const top = ((startMin - gridStartMin) / 60) * HOUR_HEIGHT;
                const height = (durationMinutes / 60) * HOUR_HEIGHT;
                
                // 動態寬度計算：(100% - 80px) / 7
                // 動態 Left 計算：80px + (dayIndex * (100% - 80px) / 7)
                const totalColumns = DAYS.length; // 7

                return (
                  <div
                    key={event.id}
                    onClick={() => openEditModal(event)}
                    className={`absolute z-10 m-1 rounded-md border-l-4 cursor-pointer hover:ring-1 hover:ring-black/10 transition-colors text-xs overflow-hidden leading-tight ${isTinyEvent ? 'flex flex-col justify-center gap-0.5 px-1.5 py-1' : isCompactEvent ? 'grid grid-rows-4 px-1.5 py-1' : 'flex flex-col gap-1 p-2'} ${event.color} hover:brightness-95 print:border`}
                    style={{
                      top: `${top}px`,
                      height: `${height - 2}px`,
                      left: `calc(80px + ${(dayIndex * 100) / totalColumns}% - ${(dayIndex * 80) / totalColumns}px + 2px)`,
                      width: `calc((100% - 80px) / ${totalColumns} - 4px)`
                    }}
                  >
                    {isTinyEvent ? (
                      <>
                        <div className="truncate text-[10px] font-bold leading-[12px]">{event.subject}</div>
                        <div className="truncate text-[9px] leading-[11px] opacity-90">{event.description}</div>
                      </>
                    ) : isCompactEvent ? (
                      <>
                        <div className="flex min-h-0 items-center truncate text-[11px] font-bold leading-none">
                          <span className="truncate">{event.subject}</span>
                        </div>
                        <div className="flex min-h-0 items-center truncate text-[10px] leading-none opacity-90">
                          <span className="truncate">{event.description}</span>
                        </div>
                        <div className="flex min-h-0 min-w-0 items-center gap-1 text-[9px] leading-none opacity-80">
                          <Clock size={9} className="shrink-0" />
                          <span className="truncate">{formatTime12H(event.start)}–{formatTime12H(event.end)}</span>
                        </div>
                        <div className="flex min-h-0 min-w-0 items-center gap-1 text-[9px] leading-none opacity-80">
                          <MapPin size={9} className="shrink-0" />
                          <span className="truncate">{event.room || '—'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-sm shrink-0 truncate">{event.subject}</div>
                        <div className="shrink-0 opacity-90 truncate">{event.description}</div>
                      </>
                    )}
                    {!isTinyEvent && !isCompactEvent && (
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
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>

      {/* Print / Export Modal */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePrintModal();
          }}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 id="print-dialog-title" className="text-gray-900 font-semibold text-lg">
                  Export schedule
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Choose the size you want to download.</p>
              </div>
              <button
                type="button"
                onClick={closePrintModal}
                disabled={isExporting}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
                aria-label="Close export dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePrint('a4')}
                disabled={isExporting}
                className="group text-left rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                <span className="w-11 h-11 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center mb-4 group-hover:bg-white">
                  <FileText size={22} />
                </span>
                <span className="block font-semibold text-gray-900">A4</span>
                <span className="block text-sm text-gray-500 mt-1">Landscape · PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrint('wallpaper')}
                disabled={isExporting}
                className="group text-left rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                <span className="w-11 h-11 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center mb-4 group-hover:bg-white">
                  <Smartphone size={22} />
                </span>
                <span className="block font-semibold text-gray-900">Phone wallpaper</span>
                <span className="block text-sm text-gray-500 mt-1">1440 × 3120 · JPG</span>
              </button>
            </div>

            {(isExporting || printError) && (
              <div className="px-6 pb-5">
                {isExporting && (
                  <div className="flex items-center gap-2 text-sm text-gray-600" role="status">
                    <LoaderCircle size={16} className="animate-spin" />
                    Preparing your download…
                  </div>
                )}
                {printError && (
                  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {printError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-gray-900 font-semibold text-lg">Import Schedule</h3>
              <button type="button" onClick={closeImportModal} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close import dialog">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImport} className="p-6 space-y-4">
              <div>
                <label htmlFor="import-data" className="block text-sm font-medium text-gray-700 mb-1">
                  Paste your schedule data
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Importing will replace the current schedule and save it automatically.
                  <br/>
                  <b>Copy ‘Enrolled Subjects’ from your ADU Live, then paste it into the content box.</b>
                </p>
                <textarea
                  id="import-data"
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    if (importError) setImportError('');
                  }}
                  rows={14}
                  autoFocus
                  placeholder={'Section\nSubject\nUnits\n29082\nIT327L : APPLICATIONS DEVT LAB (290048)\nTH 14:00-17:00 CL10\n1'}
                  className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-500 outline-none"
                />
              </div>

              {importError && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {importError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeImportModal} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium">
                  <Upload size={16} /> Confirm Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-gray-900 font-semibold text-lg">
                    {editingEvent ? 'Edit Subject' : 'Add Subject'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close subject dialog">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              
              {/* Mode Selection */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Schedule Model：</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={!isContinuous} 
                        onChange={() => setIsContinuous(false)}
                        className="accent-gray-900"
                      />
                      <span className="text-sm text-gray-600">Single</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={isContinuous} 
                        onChange={() => setIsContinuous(true)}
                        className="accent-gray-900"
                      />
                      <span className="text-sm text-gray-600">Continue</span>
                  </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course code</label>
                    <input name="subject" defaultValue={editingEvent?.subject} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:border-gray-500 outline-none transition" placeholder="e.g. IT226" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name / Description</label>
                    <input name="description" defaultValue={editingEvent?.description} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:border-gray-500 outline-none transition" placeholder="e.g. ADV. DATABASE" />
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    
                    {!isContinuous ? (
                        // Single Mode: Dropdown
                        <select name="day" defaultValue={editingEvent?.day || 'Monday'} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-400 outline-none">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    ) : (
                        // Continuous Mode: Checkboxes (Grid adjusted for 7 days might need smaller font or more columns)
                        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                            {DAYS.map(d => (
                                <label key={d} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                    <div 
                                        className={`w-4 h-4 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${selectedDays.includes(d) ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'}`}
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
                                 className={`w-8 h-8 rounded-full ${color.bg} border-2 flex items-center justify-center transition-colors ${selectedColor === color.value ? 'border-gray-700 ring-2 ring-gray-200' : 'border-transparent'}`}
                                 title={color.name}
                             >
                                 {selectedColor === color.value && <Check size={14} className="text-gray-700" />}
                             </button>
                         ))}
                     </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input name="room" defaultValue={editingEvent?.room} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-400 outline-none" placeholder="e.g. SV311" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                    <input type="time" name="start" defaultValue={editingEvent?.start || '08:00'} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-400 outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                    <input type="time" name="end" defaultValue={editingEvent?.end || '09:00'} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-400 outline-none" required />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                {editingEvent && (
                  <button type="button" onClick={() => handleDelete(editingEvent.id)} className="flex-1 flex justify-center items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors font-medium">
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button type="submit" className="flex-[2] flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium">
                    <Save size={16} /> {editingEvent ? (isContinuous ? 'Update' : 'Save') : 'New'}
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
