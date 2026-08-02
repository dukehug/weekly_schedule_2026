import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useScheduleExport } from './useScheduleExport.js';

const ExportProbe = () => {
  const exportState = useScheduleExport({
    events: [],
    backgroundPicture: null,
    backgroundOverlayOpacity: 0.72,
  });
  return createElement('output', null, JSON.stringify({
    error: exportState.exportError,
    isExporting: exportState.isExporting,
    canExport: typeof exportState.exportScheduleFile === 'function',
  }));
};

test('initializes export status and exposes the export action', () => {
  const markup = renderToStaticMarkup(createElement(ExportProbe));
  assert.match(markup, /&quot;error&quot;:&quot;&quot;/);
  assert.match(markup, /&quot;isExporting&quot;:false/);
  assert.match(markup, /&quot;canExport&quot;:true/);
});
