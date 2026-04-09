import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Collapse,
  IconButton,
  Stack
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon,
  Person as CaregiverIcon,
  Psychology as TherapyIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';
import { USER_ROLES, ROLE_DISPLAY } from '../constants/roles';
import { getRoleColor } from '../assets/theme/roleColors';

const InviteRoleSelectionPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Get childId from either state (new way) or searchParams (fallback)
  const childId = location.state?.childId || searchParams.get('childId');
  const [expandedCard, setExpandedCard] = useState(null);

  const roleOptions = [
    {
      role: USER_ROLES.CARE_PARTNER,
      icon: FamilyIcon,
      color: getRoleColor('carePartner', 'primary'), // Violet #8B5CF6
      route: '/invite/carepartner',
      title: 'Care Partner',
      subtitle: 'Family member or close friend',
      description: 'Family members and close friends who provide regular care and support',
      permissions: [
        'View all entries and progress',
        'Add daily activities and notes',
        'Upload photos and videos',
        'Access analytics and reports',
        'Communicate with care team'
      ]
    },
    {
      role: USER_ROLES.CAREGIVER,
      icon: CaregiverIcon,
      color: getRoleColor('caregiver', 'primary'), // Emerald Green #059669
      route: '/invite/caregiver',
      title: 'Caregiver',
      subtitle: 'Professional helper or aide',
      description: 'Professional helpers, nannies, teachers, or other paid caregivers',
      permissions: [
        'Add daily activities and mood',
        'Upload photos and videos',
        'View shared progress data',
        'Communicate with care team',
        'Edit their own entries only'
      ]
    },
    {
      role: USER_ROLES.THERAPIST,
      icon: TherapyIcon,
      color: getRoleColor('therapist', 'primary'), // Teal #0891B2
      route: '/invite/therapist',
      title: 'Therapist',
      subtitle: 'Professional advisor or specialist',
      description: 'Licensed professionals providing specialized therapeutic services',
      permissions: [
        'View all progress and analytics',
        'Add professional notes',
        'Access medical information',
        'Export reports',
        'Professional guidance only'
      ]
    }
  ];

  const handleRoleSelect = (route) => {
    // Pass along childId if it was provided
    const url = childId ? `${route}?childId=${childId}` : route;
    navigate(url);
  };

  const toggleExpanded = (roleKey, e) => {
    e.stopPropagation(); // Prevent card click
    setExpandedCard(expandedCard === roleKey ? null : roleKey);
  };

  return (
    <ResponsiveLayout pageTitle="Invite" showBottomNav={false}>
      <Container maxWidth="sm" sx={{ mt: { xs: 1.5, md: 2 }, mb: 4, px: { xs: 1.5, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            + Build Your Care Team
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            Choose who you'd like to invite to your care team
          </Typography>
        </Box>

        {/* Role Cards - Single Column */}
        <Stack spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 4 }}>
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            const roleDisplay = ROLE_DISPLAY[option.role];
            const isExpanded = expandedCard === option.role;

            return (
              <Card
                key={option.role}
                elevation={0}
                sx={{
                  borderRadius: { xs: 2.25, md: 3 },
                  border: `2px solid ${alpha(option.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: alpha(option.color, 0.4),
                    boxShadow: `0 4px 12px ${alpha(option.color, 0.1)}`,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleRoleSelect(option.route)}
                  sx={{ p: 0 }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    {/* Main Card Content */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1.5, md: 2 },
                        mb: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: { xs: 34, sm: 40 },
                          color: option.color,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
                        >
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {option.subtitle}
                        </Typography>
                        <Chip
                          label={roleDisplay.badge}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(option.color, 0.15),
                            color: option.color,
                            border: `1px solid ${alpha(option.color, 0.3)}`,
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => toggleExpanded(option.role, e)}
                        sx={{
                          color: option.color,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>

                    {/* Brief Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                      {option.description}
                    </Typography>

                    {/* Expandable Permissions */}
                    <Collapse in={isExpanded}>
                      <Box sx={{
                        pt: 2,
                        borderTop: `1px solid ${alpha(option.color, 0.2)}`,
                        bgcolor: alpha(option.color, 0.03),
                        borderRadius: 2,
                        p: { xs: 1.5, md: 2 },
                        mt: 2,
                      }}>
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 600,
                          mb: 1.5,
                          color: option.color
                        }}>
                          What they can do:
                        </Typography>
                        <Stack spacing={1}>
                          {option.permissions.map((permission, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Box component="span" sx={{
                                color: option.color,
                                fontSize: '0.75rem',
                                mt: 0.5
                              }}>
                                •
                              </Box>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {permission}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Collapse>

                    {/* Action hint */}
                    <Box sx={{
                      mt: 2,
                      p: { xs: 1.5, md: 2 },
                      bgcolor: alpha(option.color, 0.05),
                      borderRadius: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{
                        color: option.color,
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}>
                        Tap to invite {option.title.toLowerCase()}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>

        {/* Help Info - Compact */}
        <Box sx={{
          p: { xs: 2, md: 3 },
          bgcolor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.info.main, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
            Need help choosing?
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Care Partners:</strong> Family members with full access
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Caregivers:</strong> Professional helpers with limited access
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Therapists:</strong> Specialists who view progress for guidance
            </Typography>
          </Stack>
        </Box>
      </Container>
    </ResponsiveLayout>
  );
};

export default InviteRoleSelectionPage;
