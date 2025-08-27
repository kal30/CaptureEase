import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  MedicalInformation as DiagnosisIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { RoleIndicator } from '../../UI';

/**
 * ChildCardHeader - Header section of child card with avatar, name, role indicator
 * Clean, theme-driven styling with no hardcoded colors
 */
const ChildCardHeader = ({
  child,
  userRole,
  canEdit = true,
  onEditChild,
  showMedicalInfo = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Left: Avatar and Child Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Avatar
          src={child.photoURL}
          alt={child.name}
          sx={{
            width: { xs: 48, md: 56 },
            height: { xs: 48, md: 56 },
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {child.name?.[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 600,
                color: 'text.primary',
                truncate: true,
              }}
            >
              {child.name}
            </Typography>
            
            <RoleIndicator 
              role={userRole} 
              variant="compact" 
              childName={child.name}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', md: '0.9rem' },
            }}
          >
            Age {child.age}
          </Typography>

          {/* Medical Info Preview */}
          {showMedicalInfo && (child.diagnosis || child.medicalProfile) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {child.diagnosis && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <DiagnosisIcon 
                    sx={{ 
                      color: 'error.main', 
                      fontSize: 14 
                    }} 
                  />
                  <Typography
                    variant="caption"
                    sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 500, 
                      color: 'error.main' 
                    }}
                  >
                    {child.diagnosis}
                  </Typography>
                </Box>
              )}

              {child.medicalProfile?.currentMedications?.length > 0 && (
                <Chip
                  icon={<HospitalIcon sx={{ fontSize: 14 }} />}
                  label={`${child.medicalProfile.currentMedications.length} meds`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: alpha('secondary.main', 0.1),
                    color: 'secondary.main',
                    border: 1,
                    borderColor: alpha('secondary.main', 0.3),
                    '& .MuiChip-icon': {
                      color: 'secondary.main',
                    },
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Right: Edit Button */}
      {canEdit && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onEditChild?.(child);
          }}
          size="small"
          sx={{
            bgcolor: alpha('primary.main', 0.1),
            color: 'primary.main',
            '&:hover': {
              bgcolor: alpha('primary.main', 0.2),
            },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default ChildCardHeader;