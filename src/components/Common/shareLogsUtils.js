const formatDateInput = (date) => date.toISOString().slice(0, 10);
const parseDateInput = (value) => (value ? new Date(`${value}T00:00:00`) : null);
const toDate = (entry) => entry?.timestamp?.toDate?.() || new Date(entry?.timestamp);

const getEntryText = (entry) =>
  entry?.text ||
  entry?.content ||
  entry?.originalData?.note ||
  entry?.originalData?.text ||
  entry?.originalData?.content ||
  '';

const getEntryTags = (entry) => {
  const tags = [
    ...(entry?.tags || []),
    ...(entry?.ai?.tags || []),
    ...(entry?.originalData?.tags || []),
    ...(entry?.originalData?.ai?.tags || [])
  ];
  return Array.from(new Set(tags.map((tag) => String(tag).trim()).filter(Boolean)));
};

const buildSummary = (entries, startDate, endDate) => {
  const uniqueDays = new Set();
  let importantCount = 0;
  const tagCounts = new Map();

  entries.forEach((entry) => {
    const entryDate = toDate(entry);
    if (Number.isNaN(entryDate.getTime())) return;

    uniqueDays.add(entryDate.toDateString());
    const noteType = entry?.meta?.noteType || entry?.originalData?.meta?.noteType;
    if (noteType === 'important') {
      importantCount += 1;
    }

    getEntryTags(entry).forEach((tag) => {
      const normalized = tag.toLowerCase();
      tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
    });
  });

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return {
    daysLogged: uniqueDays.size,
    importantCount,
    topTags,
    rangeLabel: `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
  };
};

const buildTextRecap = ({ brandName, childName, summary, entries, includeEntries }) => {
  const lines = [
    `${brandName} recap for ${childName || 'child'}`,
    `Range: ${summary.rangeLabel}`,
    `Days logged: ${summary.daysLogged}`,
    `Important moments: ${summary.importantCount}`,
    summary.topTags.length ? `Top tags: ${summary.topTags.join(', ')}` : 'Top tags: none'
  ];

  if (includeEntries) {
    lines.push('', 'Entries:');
    entries.forEach((entry) => {
      const entryDate = toDate(entry);
      const text = getEntryText(entry);
      const tags = getEntryTags(entry);
      const tagLine = tags.length ? ` (#${tags.join(', #')})` : '';
      lines.push(`- ${entryDate.toLocaleString()}: ${text}${tagLine}`);
    });
  }

  return lines.join('\n');
};

const buildPrintHtml = ({ brandName, brandLogoUrl, childName, summary, entries, includeEntries }) => {
  const entriesHtml = includeEntries
    ? entries
        .map((entry) => {
          const entryDate = toDate(entry).toLocaleString();
          const text = getEntryText(entry);
          const tags = getEntryTags(entry);
          const tagHtml = tags.length ? `<div class="tags">#${tags.join(' #')}</div>` : '';
          return `<div class="entry"><div class="entry-time">${entryDate}</div><div class="entry-text">${text}</div>${tagHtml}</div>`;
        })
        .join('')
    : '';

  return `
    <html>
      <head>
        <title>${brandName} Recap</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .brand { font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 10px; }
          .logo { width: 48px; height: 48px; object-fit: contain; }
          .subtitle { color: #6b7280; font-size: 12px; }
          .summary { margin: 16px 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .summary p { margin: 4px 0; }
          .entry { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .entry-time { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
          .entry-text { font-size: 14px; }
          .tags { font-size: 12px; color: #4b5563; margin-top: 4px; }
          .watermark {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.06;
            pointer-events: none;
            z-index: 0;
            transform: rotate(-18deg);
          }
          .watermark-inner {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 48px;
            font-weight: 700;
            color: #111827;
          }
          .watermark-logo { width: 80px; height: 80px; object-fit: contain; }
          .content { position: relative; z-index: 1; }
        </style>
      </head>
      <body>
        <div class="watermark">
          <div class="watermark-inner">
            ${brandLogoUrl ? `<img class="watermark-logo" src="${brandLogoUrl}" alt="${brandName} watermark" />` : ''}
            <span>${brandName}</span>
          </div>
        </div>
        <div class="content">
        <div class="header">
          <div class="brand">
            ${brandLogoUrl ? `<img class="logo" src="${brandLogoUrl}" alt="${brandName} logo" />` : ''}
            <span>${brandName}</span>
          </div>
          <div class="subtitle">${summary.rangeLabel}</div>
        </div>
        <div class="summary">
          <p><strong>Child:</strong> ${childName || 'Child'}</p>
          <p><strong>Days logged:</strong> ${summary.daysLogged}</p>
          <p><strong>Important moments:</strong> ${summary.importantCount}</p>
          <p><strong>Top tags:</strong> ${summary.topTags.length ? summary.topTags.join(', ') : 'none'}</p>
        </div>
        ${includeEntries ? `<div class="entries">${entriesHtml}</div>` : ''}
        </div>
      </body>
    </html>
  `;
};

export {
  formatDateInput,
  parseDateInput,
  toDate,
  buildSummary,
  buildTextRecap,
  buildPrintHtml
};
