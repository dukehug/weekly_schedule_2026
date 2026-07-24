const A4_LANDSCAPE = {
  width: 841.89,
  height: 595.28,
  margin: 28,
};

const WALLPAPER = {
  width: 1440,
  height: 3120,
  padding: 54,
};

const A4_CANVAS = {
  width: 3508,
  height: 2480,
  padding: 110,
  startHour: 7,
  endHour: 22,
};

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_LABELS = {
  Monday: 'mon',
  Tuesday: 'tue',
  Wednesday: 'wed',
  Thursday: 'thu',
  Friday: 'fri',
  Saturday: 'sat',
  Sunday: 'sun',
};

const waitForFonts = async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
};

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob(
    blob => (blob ? resolve(blob) : reject(new Error('Unable to create the export file.'))),
    type,
    quality,
  );
});

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const roundedRect = (context, x, y, width, height, radius) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

const fitText = (context, value, maxWidth) => {
  const text = String(value || '').trim();
  if (context.measureText(text).width <= maxWidth) return text;

  let shortened = text;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened.trim()}…`;
};

const groupEventsByDay = (events) => DAY_ORDER
  .map(day => ({
    day,
    events: events
      .filter(event => event.day === day)
      .sort((first, second) => first.start.localeCompare(second.start)),
  }))
  .filter(group => group.events.length > 0);

const EVENT_PALETTES = [
  { token: 'blue', fill: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
  { token: 'green', fill: '#dcfce7', border: '#4ade80', text: '#14532d' },
  { token: 'purple', fill: '#f3e8ff', border: '#c084fc', text: '#581c87' },
  { token: 'yellow', fill: '#fef9c3', border: '#facc15', text: '#713f12' },
  { token: 'red', fill: '#fee2e2', border: '#f87171', text: '#7f1d1d' },
  { token: 'indigo', fill: '#e0e7ff', border: '#818cf8', text: '#312e81' },
  { token: 'pink', fill: '#fce7f3', border: '#f472b6', text: '#831843' },
  { token: 'orange', fill: '#ffedd5', border: '#fb923c', text: '#7c2d12' },
  { token: 'teal', fill: '#ccfbf1', border: '#2dd4bf', text: '#134e4a' },
  { token: 'slate', fill: '#e2e8f0', border: '#64748b', text: '#0f172a' },
];

const paletteForEvent = (event) => (
  EVENT_PALETTES.find(palette => event.color?.includes(`-${palette.token}-`))
  || EVENT_PALETTES.at(-1)
);

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
};

const createA4ScheduleCanvas = (events) => {
  const canvas = document.createElement('canvas');
  canvas.width = A4_CANVAS.width;
  canvas.height = A4_CANVAS.height;

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gridX = A4_CANVAS.padding;
  const gridY = 220;
  const gridWidth = canvas.width - A4_CANVAS.padding * 2;
  const timeColumnWidth = 160;
  const headerHeight = 105;
  const bodyHeight = canvas.height - gridY - 105;
  const dayWidth = (gridWidth - timeColumnWidth) / DAY_ORDER.length;
  const bodyY = gridY + headerHeight;
  const totalMinutes = (A4_CANVAS.endHour - A4_CANVAS.startHour) * 60;

  context.fillStyle = '#111827';
  context.font = '700 55px system-ui, -apple-system, sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.fillText('MY WEEKLY SCHEDULE', gridX, 105);

  context.fillStyle = '#64748b';
  context.font = '500 25px system-ui, -apple-system, sans-serif';
  context.fillText('A4 · LANDSCAPE · 24-HOUR TIME', gridX, 153);

  context.fillStyle = '#f8fafc';
  context.fillRect(gridX, gridY, gridWidth, headerHeight);

  context.strokeStyle = '#d6dce5';
  context.lineWidth = 2;
  context.strokeRect(gridX, gridY, gridWidth, headerHeight + bodyHeight);

  context.fillStyle = '#64748b';
  context.font = '700 23px system-ui, -apple-system, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('TIME', gridX + timeColumnWidth / 2, gridY + headerHeight / 2);

  DAY_ORDER.forEach((day, index) => {
    const x = gridX + timeColumnWidth + index * dayWidth;
    context.fillStyle = '#334155';
    context.font = '700 26px system-ui, -apple-system, sans-serif';
    context.fillText(day.toUpperCase(), x + dayWidth / 2, gridY + headerHeight / 2);

    context.strokeStyle = '#d6dce5';
    context.beginPath();
    context.moveTo(x, gridY);
    context.lineTo(x, gridY + headerHeight + bodyHeight);
    context.stroke();
  });

  const hourHeight = bodyHeight / (A4_CANVAS.endHour - A4_CANVAS.startHour);
  for (let hour = A4_CANVAS.startHour; hour <= A4_CANVAS.endHour; hour += 1) {
    const y = bodyY + (hour - A4_CANVAS.startHour) * hourHeight;

    context.strokeStyle = hour === A4_CANVAS.endHour ? '#d6dce5' : '#e8ecf1';
    context.beginPath();
    context.moveTo(gridX, y);
    context.lineTo(gridX + gridWidth, y);
    context.stroke();

    if (hour < A4_CANVAS.endHour) {
      context.fillStyle = '#64748b';
      context.font = '600 20px system-ui, -apple-system, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.fillText(`${String(hour).padStart(2, '0')}:00`, gridX + timeColumnWidth / 2, y + 10);
    }
  }

  events.forEach((event) => {
    const dayIndex = DAY_ORDER.indexOf(event.day);
    if (dayIndex < 0) return;

    const start = Math.max(
      A4_CANVAS.startHour * 60,
      timeToMinutes(event.start),
    );
    const end = Math.min(
      A4_CANVAS.endHour * 60,
      timeToMinutes(event.end),
    );
    if (end <= start) return;

    const x = gridX + timeColumnWidth + dayIndex * dayWidth + 7;
    const y = bodyY + ((start - A4_CANVAS.startHour * 60) / totalMinutes) * bodyHeight + 4;
    const width = dayWidth - 14;
    const height = Math.max(22, ((end - start) / totalMinutes) * bodyHeight - 8);
    const palette = paletteForEvent(event);
    const compact = height < 88;
    const veryCompact = height < 54;

    roundedRect(context, x, y, width, height, 12);
    context.fillStyle = palette.fill;
    context.fill();

    context.fillStyle = palette.border;
    context.fillRect(x, y + 7, 8, Math.max(8, height - 14));

    context.save();
    context.beginPath();
    context.rect(x + 15, y + 4, width - 22, height - 8);
    context.clip();

    context.fillStyle = palette.text;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = `700 ${veryCompact ? 23 : compact ? 27 : 34}px system-ui, -apple-system, sans-serif`;
    context.fillText(fitText(context, event.subject, width - 34), x + 21, y + (veryCompact ? 7 : 12));

    if (!veryCompact) {
      context.globalAlpha = 0.84;
      context.font = `600 ${compact ? 17 : 21}px system-ui, -apple-system, sans-serif`;
      context.fillText(
        fitText(context, event.description || '', width - 34),
        x + 21,
        y + (compact ? 48 : 56),
      );
    }

    if (!compact) {
      context.globalAlpha = 0.72;
      context.font = '600 18px system-ui, -apple-system, sans-serif';
      context.fillText(
        fitText(context, `${event.start}–${event.end} · ${event.room || '—'}`, width - 34),
        x + 21,
        y + height - 34,
      );
    }
    context.restore();
  });

  return canvas;
};

const createWallpaperCanvas = (events) => {
  const canvas = document.createElement('canvas');
  canvas.width = WALLPAPER.width;
  canvas.height = WALLPAPER.height;

  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height * 0.25);
  gradient.addColorStop(0, '#ccffd8');
  gradient.addColorStop(0.48, '#bce8eb');
  gradient.addColorStop(1, '#91b4ff');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const verticalGlow = context.createLinearGradient(0, 0, 0, canvas.height);
  verticalGlow.addColorStop(0, 'rgba(255,255,255,0.22)');
  verticalGlow.addColorStop(0.65, 'rgba(255,255,255,0.06)');
  verticalGlow.addColorStop(1, 'rgba(255,255,255,0.28)');
  context.fillStyle = verticalGlow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const groups = groupEventsByDay(events);
  const activeDayNames = groups.map(group => group.day);
  const sessionCount = groups.reduce((total, group) => total + group.events.length, 0);
  const firstDay = activeDayNames[0] || 'Monday';
  const lastDay = activeDayNames.at(-1) || 'Sunday';

  context.fillStyle = '#10243d';
  context.font = '500 82px system-ui, -apple-system, sans-serif';
  context.textAlign = 'center';
  context.fillText('WEEKLY SCHEDULE', canvas.width / 2, 134);

  context.fillStyle = 'rgba(16, 36, 61, 0.84)';
  context.font = '700 25px system-ui, -apple-system, sans-serif';
  context.letterSpacing = '2px';
  context.fillText(
    `${firstDay.toUpperCase()} TO ${lastDay.toUpperCase()} `,
    canvas.width / 2,
    194,
  );

  context.strokeStyle = 'rgba(16, 36, 61, 0.34)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(520, 236);
  context.lineTo(920, 236);
  context.stroke();

  if (groups.length === 0) {
    context.fillStyle = 'rgba(255,255,255,0.18)';
    roundedRect(context, WALLPAPER.padding, 340, canvas.width - WALLPAPER.padding * 2, 360, 80);
    context.fill();
    context.strokeStyle = 'rgba(16, 36, 61, 0.38)';
    context.stroke();
    context.fillStyle = '#10243d';
    context.font = '500 48px system-ui, -apple-system, sans-serif';
    context.fillText('NO CLASSES YET', canvas.width / 2, 545);
    return canvas;
  }

  const cardX = WALLPAPER.padding;
  const cardWidth = canvas.width - WALLPAPER.padding * 2;
  const cardsTop = 310;
  const cardsBottom = 2690;
  const cardGap = 26;
  const cardPaddingY = 30;
  const availableCardsHeight = cardsBottom - cardsTop;
  const totalGap = (groups.length - 1) * cardGap;
  const rowHeight = Math.max(
    58,
    Math.min(
      146,
      (availableCardsHeight - totalGap - groups.length * cardPaddingY * 2) / sessionCount,
    ),
  );
  const cardsHeight = groups.reduce(
    (total, group) => total + cardPaddingY * 2 + group.events.length * rowHeight,
    0,
  ) + totalGap;
  const verticalOffset = Math.max(0, (availableCardsHeight - cardsHeight) / 2);
  let cardY = cardsTop + verticalOffset;

  groups.forEach((group, groupIndex) => {
    const cardHeight = cardPaddingY * 2 + group.events.length * rowHeight;
    const isFilled = groupIndex % 2 === 1;

    roundedRect(context, cardX, cardY, cardWidth, cardHeight, 82);
    if (isFilled) {
      context.fillStyle = 'rgba(74, 116, 171, 0.13)';
      context.fill();
    } else {
      context.strokeStyle = 'rgba(32, 70, 112, 0.42)';
      context.lineWidth = 2.5;
      context.stroke();
    }

    const dayColumnWidth = 226;
    const contentX = cardX + dayColumnWidth + 36;
    const contentRight = cardX + cardWidth - 42;
    const timeWidth = 210;
    const roomWidth = 150;
    const subjectX = contentX + timeWidth;
    const subjectWidth = contentRight - subjectX - roomWidth - 28;

    context.strokeStyle = 'rgba(32, 70, 112, 0.18)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(cardX + dayColumnWidth, cardY + 42);
    context.lineTo(cardX + dayColumnWidth, cardY + cardHeight - 42);
    context.stroke();

    context.fillStyle = '#10243d';
    context.font = '400 58px system-ui, -apple-system, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      DAY_LABELS[group.day],
      cardX + dayColumnWidth / 2,
      cardY + cardHeight / 2,
    );

    group.events.forEach((event, eventIndex) => {
      const rowTop = cardY + cardPaddingY + eventIndex * rowHeight;
      const rowCenter = rowTop + rowHeight / 2;
      const compact = rowHeight < 92;

      if (eventIndex > 0) {
        context.strokeStyle = 'rgba(32, 70, 112, 0.10)';
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(contentX, rowTop);
        context.lineTo(contentRight, rowTop);
        context.stroke();
      }

      context.fillStyle = '#17304d';
      context.textAlign = 'left';
      context.textBaseline = 'middle';
      context.font = `700 ${compact ? 23 : 27}px system-ui, -apple-system, sans-serif`;
      context.fillText(`${event.start}–${event.end}`, contentX + 8, rowCenter);

      context.font = `700 ${compact ? 27 : 33}px system-ui, -apple-system, sans-serif`;
      context.fillText(
        fitText(context, event.subject, subjectWidth),
        subjectX,
        rowCenter - (compact ? 11 : 18),
      );

      context.fillStyle = 'rgba(23, 48, 77, 0.84)';
      context.font = `700 ${compact ? 17 : 20}px system-ui, -apple-system, sans-serif`;
      context.fillText(
        fitText(context, String(event.description || '').toUpperCase(), subjectWidth),
        subjectX,
        rowCenter + (compact ? 15 : 19),
      );

      context.fillStyle = '#17304d';
      context.font = `700 ${compact ? 22 : 27}px system-ui, -apple-system, sans-serif`;
      context.textAlign = 'right';
      context.fillText(
        fitText(context, event.room || '—', roomWidth),
        contentRight,
        rowCenter,
      );
    });

    cardY += cardHeight + cardGap;
  });

  const footerY = 2812;
  const daySummary = groups.map(group => DAY_LABELS[group.day].toUpperCase()).join(' · ');
  const rooms = [...new Set(
    events.map(event => event.room?.trim()).filter(Boolean),
  )];

  context.fillStyle = 'rgba(16, 36, 61, 0.72)';
  context.textBaseline = 'alphabetic';
  context.font = '700 22px system-ui, -apple-system, sans-serif';
  context.textAlign = 'left';
  context.fillText(`${groups.length} STUDY DAYS`, 88, footerY);
  context.textAlign = 'center';
  context.fillText(`${sessionCount} CLASS SESSIONS`, canvas.width / 2, footerY);
  context.textAlign = 'right';
  context.fillText(daySummary, canvas.width - 88, footerY);

  context.strokeStyle = 'rgba(32, 70, 112, 0.14)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(88, footerY + 42);
  context.lineTo(canvas.width - 88, footerY + 42);
  context.stroke();

  context.textAlign = 'left';
  context.fillText('ROOMS', 88, footerY + 108);
  context.fillText(
    fitText(context, rooms.join(' · ') || '—', canvas.width - 270),
    238,
    footerY + 108,
  );

  return canvas;
};

const dataUrlToBytes = (dataUrl) => {
  const binary = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const concatBytes = (...parts) => {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
};

const createPdfBlob = (canvas) => {
  const encoder = new TextEncoder();
  const jpegBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.94));
  const { width: pageWidth, height: pageHeight, margin } = A4_LANDSCAPE;
  const scale = Math.min(
    (pageWidth - margin * 2) / canvas.width,
    (pageHeight - margin * 2) / canvas.height,
  );
  const drawWidth = canvas.width * scale;
  const drawHeight = canvas.height * scale;
  const x = (pageWidth - drawWidth) / 2;
  const y = (pageHeight - drawHeight) / 2;
  const content = `q ${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`;

  const objects = [
    encoder.encode('<< /Type /Catalog /Pages 2 0 R >>'),
    encoder.encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
    concatBytes(
      encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
      jpegBytes,
      encoder.encode('\nendstream'),
    ),
    encoder.encode(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`),
  ];

  const chunks = [encoder.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(chunks.reduce((total, chunk) => total + chunk.length, 0));
    chunks.push(encoder.encode(`${index + 1} 0 obj\n`), object, encoder.encode('\nendobj\n'));
  });

  const xrefOffset = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const xref = [
    'xref',
    `0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');
  chunks.push(encoder.encode(xref));

  return new Blob([concatBytes(...chunks)], { type: 'application/pdf' });
};

export const exportSchedule = async (format, events = []) => {
  if (format === 'a4') {
    await waitForFonts();
    const scheduleCanvas = createA4ScheduleCanvas(events);
    downloadBlob(createPdfBlob(scheduleCanvas), 'weekly-schedule-a4.pdf');
    return;
  }

  if (format === 'wallpaper') {
    await waitForFonts();
    const wallpaperCanvas = createWallpaperCanvas(events);
    const blob = await canvasToBlob(wallpaperCanvas, 'image/jpeg', 0.94);
    downloadBlob(blob, 'weekly-schedule-wallpaper.jpg');
    return;
  }

  throw new Error('Unknown export format.');
};
