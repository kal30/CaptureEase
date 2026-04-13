export const incidentTheme = {
  header: '#F5F3F0',
  white: '#FFFFFF',
  context: '#E6F1FB',
  triggers: '#FBEAF0',
  save: '#1D9E75',
  saveHover: '#178361',
  severityHigh: '#FED7AA',
  severityText: '#8A4F00',
  border: 'rgba(17, 24, 39, 0.12)',
  softBorder: 'rgba(29, 158, 117, 0.18)',
};

export const incidentSectionSx = (bg, border = incidentTheme.border) => ({
  borderRadius: '20px',
  border: `1px solid ${border}`,
  backgroundColor: bg,
});

