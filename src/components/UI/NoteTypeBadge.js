import { Chip } from '@mui/material';
import { Star, Description } from '@mui/icons-material';

/**
 * Badge component to display note classification (Important Moment vs Daily Log)
 * @param {Object} props
 * @param {string} props.noteType - 'important' or 'routine'
 * @param {string} props.size - 'small' or 'medium' (default: 'small')
 * @param {boolean} props.showIcon - Whether to show the icon (default: true)
 */
const NoteTypeBadge = ({ noteType, size = 'small', showIcon = true }) => {
  if (!noteType) return null;

  const isImportant = noteType === 'important';

  return (
    <Chip
      icon={showIcon ? (isImportant ? <Star /> : <Description />) : undefined}
      label={isImportant ? 'Important Moment' : 'Daily Log'}
      size={size}
      sx={{
        backgroundColor: isImportant ? '#FEF3C7' : '#E0E7FF',
        color: isImportant ? '#92400E' : '#3730A3',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 20 : 24,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? '0.9rem' : '1rem',
          color: isImportant ? '#F59E0B' : '#6366F1',
        },
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
};

export default NoteTypeBadge;
