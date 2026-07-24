const A4_LANDSCAPE = {
  width: 841.89,
  height: 595.28,
  margin: 28,
};

const WALLPAPER = {
  width: 1440,
  height: 3200,
  padding: 72,
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

const createWallpaperCanvas = (scheduleCanvas) => {
  const canvas = document.createElement('canvas');
  canvas.width = WALLPAPER.width;
  canvas.height = WALLPAPER.height;

  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#e2e8f0');
  gradient.addColorStop(0.35, '#f8fafc');
  gradient.addColorStop(1, '#ffffff');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#0f172a';
  context.font = '700 74px system-ui, -apple-system, sans-serif';
  context.textAlign = 'center';
  context.fillText('MY WEEKLY SCHEDULE', canvas.width / 2, 190);

  context.fillStyle = '#64748b';
  context.font = '500 30px system-ui, -apple-system, sans-serif';
  context.fillText('YOUR WEEK AT A GLANCE', canvas.width / 2, 248);

  const availableWidth = canvas.width - WALLPAPER.padding * 2;
  const availableHeight = canvas.height - 440;
  const scale = Math.min(
    availableWidth / scheduleCanvas.width,
    availableHeight / scheduleCanvas.height,
  );
  const drawWidth = scheduleCanvas.width * scale;
  const drawHeight = scheduleCanvas.height * scale;
  const x = (canvas.width - drawWidth) / 2;
  const y = 340;

  context.save();
  context.shadowColor = 'rgba(15, 23, 42, 0.16)';
  context.shadowBlur = 42;
  context.shadowOffsetY = 16;
  context.fillStyle = '#ffffff';
  roundedRect(context, x - 18, y - 18, drawWidth + 36, drawHeight + 36, 28);
  context.fill();
  context.restore();

  context.drawImage(scheduleCanvas, x, y, drawWidth, drawHeight);

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

export const exportSchedule = async (element, format) => {
  if (!element) {
    throw new Error('The schedule is not ready to export.');
  }

  const scheduleCanvas = await elementToCanvas(element);

  if (format === 'a4') {
    downloadBlob(createPdfBlob(scheduleCanvas), 'weekly-schedule-a4.pdf');
    return;
  }

  if (format === 'wallpaper') {
    const wallpaperCanvas = createWallpaperCanvas(scheduleCanvas);
    const blob = await canvasToBlob(wallpaperCanvas, 'image/jpeg', 0.94);
    downloadBlob(blob, 'weekly-schedule-wallpaper.jpg');
    return;
  }

  throw new Error('Unknown export format.');
};
