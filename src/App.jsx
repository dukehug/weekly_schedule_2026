import { useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import BackgroundPictureModal from './components/BackgroundPictureModal.jsx';
import EventModal from './components/EventModal.jsx';
import ExportScheduleModal from './components/ExportScheduleModal.jsx';
import ImportScheduleModal from './components/ImportScheduleModal.jsx';
import ScheduleGrid from './components/ScheduleGrid.jsx';
import { useBackgroundPicture } from './hooks/useBackgroundPicture.js';
import { useSchedule } from './hooks/useSchedule.js';
import { useTheme } from './hooks/useTheme.js';

const App = () => {
  const {
    events,
    deleteEvent,
    importSchedule,
    resetSchedule,
    saveEvent,
    saveSchedule,
  } = useSchedule();
  const { theme, setTheme } = useTheme();
  const {
    backgroundOverlayOpacity,
    backgroundPicture,
    backgroundPictureError,
    clearBackgroundPicture,
    selectBackgroundPicture,
    setBackgroundOverlayOpacity,
    setBackgroundPictureError,
  } = useBackgroundPicture();

  const [editingEvent, setEditingEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  const openNewEventModal = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this subject?');
    if (!shouldDelete) {
      return;
    }

    deleteEvent(eventId);
    closeEventModal();
  };

  const handleResetSchedule = () => {
    const shouldReset = window.confirm(
      'Are you sure you want to clear all data? This operation cannot be undone.',
    );
    if (shouldReset) {
      resetSchedule();
    }
  };

  const handleSaveSchedule = () => {
    saveSchedule();
    window.alert('Saved successfully');
  };

  const openBackgroundModal = () => {
    setBackgroundPictureError('');
    setIsBackgroundModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-gray-900 transition-colors md:p-6 print:bg-white print:p-0">
      <AppHeader
        theme={theme}
        onThemeChange={setTheme}
        onAddEvent={openNewEventModal}
        onImport={() => setIsImportModalOpen(true)}
        onSave={handleSaveSchedule}
        onOpenBackground={openBackgroundModal}
        onOpenExport={() => setIsExportModalOpen(true)}
        onReset={handleResetSchedule}
      />

      <ScheduleGrid events={events} onEditEvent={openEditEventModal} />

      {isEventModalOpen && (
        <EventModal
          editingEvent={editingEvent}
          onClose={closeEventModal}
          onDelete={handleDeleteEvent}
          onSave={saveEvent}
        />
      )}

      {isImportModalOpen && (
        <ImportScheduleModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={importSchedule}
        />
      )}

      {isBackgroundModalOpen && (
        <BackgroundPictureModal
          backgroundPicture={backgroundPicture}
          backgroundOverlayOpacity={backgroundOverlayOpacity}
          backgroundPictureError={backgroundPictureError}
          onClose={() => setIsBackgroundModalOpen(false)}
          onSelect={selectBackgroundPicture}
          onClear={clearBackgroundPicture}
          onOpacityChange={setBackgroundOverlayOpacity}
        />
      )}

      {isExportModalOpen && (
        <ExportScheduleModal
          events={events}
          backgroundPicture={backgroundPicture}
          backgroundOverlayOpacity={backgroundOverlayOpacity}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
