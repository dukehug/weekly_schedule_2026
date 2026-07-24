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

const copyComputedStyles = (source, clone) => {
  const sourceElements = [source, ...source.querySelectorAll('*')];
  const cloneElements = [clone, ...clone.querySelectorAll('*')];

  sourceElements.forEach((sourceElement, index) => {
    const cloneElement = cloneElements[index];
    if (!cloneElement) return;

    const styles = window.getComputedStyle(sourceElement);
    for (const property of styles) {
      cloneElement.style.setProperty(
        property,
        styles.getPropertyValue(property),
        styles.getPropertyPriority(property),
      );
    }

    cloneElement.style.animation = 'none';
    cloneElement.style.transition = 'none';
  });
};

const elementToCanvas = async (element, pixelRatio = 2) => {
  await waitForFonts();

  const width = Math.ceil(element.scrollWidth);
  const height = Math.ceil(element.scrollHeight);
  const clone = element.cloneNode(true);

  copyComputedStyles(element, clone);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.maxWidth = 'none';
  clone.style.overflow = 'visible';
  clone.style.margin = '0';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.background = '#ffffff';
  wrapper.appendChild(clone);

  const serialized = new XMLSerializer().serializeToString(wrapper);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<foreignObject width="100%" height="100%">${serialized}</foreignObject>`,
    '</svg>',
  ].join('');

  const imageUrl = URL.createObjectURL(
    new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
  );

  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);

    const context = canvas.getContext('2d');
    context.scale(pixelRatio, pixelRatio);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas;
  } finally {
    URL.revokeObjectURL(imageUrl);
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

export const exportSchedule = async (element, format, events = []) => {
  if (format === 'a4') {
    if (!element) {
      throw new Error('The schedule is not ready to export.');
    }
    const scheduleCanvas = await elementToCanvas(element);
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
