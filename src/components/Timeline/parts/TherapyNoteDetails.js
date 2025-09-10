import { Box, Typography, Chip } from '@mui/material';
import { therapyTheme, getTherapyNoteStatusColor } from '../../../assets/theme/therapyTheme';

const TherapyNoteDetails = ({ entry }) => {
  // Don't render if entry has no meaningful content
  const hasContent = entry.content || entry.title || (entry.tags && entry.tags.length > 0);
  
  if (!hasContent) {
    return null;
  }

  // Get status color based on note type
  const statusColor = getTherapyNoteStatusColor(entry.noteType);

  return (
    <Box>
      {/* Professional Header */}
      <Box sx={{ 
        mb: 1, 
        p: 1, 
        bgcolor: therapyTheme.background.subtle, 
        borderRadius: 1, 
        border: `1px solid ${therapyTheme.border.light}`,
        borderLeft: `4px solid ${statusColor}`
      }}>
        <Typography variant="caption" sx={{ 
          color: 'text.secondary', 
          fontSize: '0.7rem', 
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🩺 Professional Note • {entry.sessionType || 'Therapy'} • {entry.clinicalArea || 'General'}
        </Typography>
      </Box>

      {/* Title */}
      {entry.title && entry.title !== 'Therapy Note' && (
        <Typography variant="subtitle2" sx={{ 
          color: 'text.primary', 
          mb: 0.5, 
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {entry.title}
        </Typography>
      )}

      {/* Content */}
      {entry.content && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5, lineHeight: 1.4 }}>
          {entry.content.length > 200 ? `${entry.content.substring(0, 200)}...` : entry.content}
        </Typography>
      )}

      {/* Note Type Indicator */}
      {entry.noteType && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Chip
            label={entry.noteType}
            size="small"
            sx={{
              fontSize: '0.7rem',
              height: 20,
              bgcolor: therapyTheme.primary + '40',
              color: 'text.primary',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          />
        </Box>
      )}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {entry.tags.map((tag) => (
            <Typography
              key={tag}
              component="span"
              variant="caption"
              sx={{ 
                mr: 0.5, 
                px: 0.5, 
                py: 0.25, 
                bgcolor: therapyTheme.primary + '30', 
                borderRadius: 0.5, 
                fontSize: '0.7rem',
                fontWeight: 500
              }}
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </Typography>
          ))}
        </Box>
      )}

      {/* Replies indicator */}
      {entry.replies && entry.replies.length > 0 && (
        <Box sx={{ 
          mt: 1, 
          p: 0.5, 
          bgcolor: 'grey.50', 
          borderRadius: 1, 
          border: '1px solid', 
          borderColor: 'grey.200' 
        }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontSize: '0.7rem', 
            fontWeight: 500 
          }}>
            💬 {entry.replies.length} {entry.replies.length === 1 ? 'reply' : 'replies'} from care team
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TherapyNoteDetails;