import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ToysIcon from '@mui/icons-material/Toys';
import SocialDistanceIcon from '@mui/icons-material/SocialDistance';
import PanToolIcon from '@mui/icons-material/PanTool';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { getBehaviorTemplates, deleteBehaviorTemplate } from '../../services/behaviorService';

const iconMap = {
  TrackChangesIcon: TrackChangesIcon,
  TouchAppIcon: TouchAppIcon,
  RecordVoiceOverIcon: RecordVoiceOverIcon,
  VisibilityIcon: VisibilityIcon,
  ToysIcon: ToysIcon,
  SocialDistanceIcon: SocialDistanceIcon,
  PanToolIcon: PanToolIcon,
};

const staticTemplates = {
  'Social Interaction': [
    { name: 'Making Eye Contact', description: 'Establishing and maintaining eye contact during social exchanges.', icon: <VisibilityIcon color="primary" />, iconName: 'VisibilityIcon' },
    { name: 'Responding to Name', description: 'Orienting towards or acknowledging when their name is called.', icon: <RecordVoiceOverIcon color="secondary" />, iconName: 'RecordVoiceOverIcon' },
    { name: 'Turn-Taking', description: 'Waiting for one\'s turn and allowing others to have theirs in games or conversations.', icon: <SocialDistanceIcon color="success" />, iconName: 'SocialDistanceIcon' },
  ],
  'Repetitive Behaviors (Stimming)': [
    { name: 'Hand Flapping', description: 'Repetitive flapping of hands, often associated with excitement or self-stimulation.', icon: <TouchAppIcon color="warning" />, iconName: 'TouchAppIcon' },
    { name: 'Rocking', description: 'Repetitive back-and-forth movement of the torso.', icon: <ToysIcon color="error" />, iconName: 'ToysIcon' },
    { name: 'Vocal Stimming', description: 'Making repetitive sounds or noises, suchs as humming or repeating phrases.', icon: <RecordVoiceOverIcon color="info" />, iconName: 'RecordVoiceOverIcon' },
  ],
  'Challenging Behaviors': [
      { name: 'Tantrums/Meltdowns', description: 'Intense emotional outbursts, which may include crying, screaming, or physical displays.', icon: <PanToolIcon color="error" />, iconName: 'PanToolIcon' },
      { name: 'Throwing Objects', description: 'Propelling objects through the air in a forceful manner.', icon: <ToysIcon color="warning" />, iconName: 'ToysIcon' },
  ],
};

const CategorizedBehaviorTemplates = ({ childId, onSelectTemplate, refreshTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userTemplates, setUserTemplates] = useState([]);

  const fetchUserTemplates = async () => {
    if (childId) {
      const templates = await getBehaviorTemplates(childId);
      setUserTemplates(templates.map(t => ({ ...t, icon: t.iconName ? React.createElement(iconMap[t.iconName]) : <TrackChangesIcon />, iconName: t.iconName || 'TrackChangesIcon' }))); // Default icon for user templates
    }
  };

  useEffect(() => {
    fetchUserTemplates();
  }, [childId, refreshTrigger]);

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteBehaviorTemplate(templateId);
      fetchUserTemplates(); // Re-fetch templates after deletion
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const allTemplates = {
      ...(userTemplates.length > 0 && { 'My Templates': userTemplates }),
      ...staticTemplates,
  };


  const filteredTemplates = Object.keys(allTemplates).reduce((acc, category) => {
    const filtered = allTemplates[category].filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
            Start with a Template
        </Typography>
      <TextField
        fullWidth
        label="Search Templates"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {Object.keys(filteredTemplates).map(category => (
        <Accordion key={category} defaultExpanded={!!searchTerm || category === 'My Templates'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{category}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filteredTemplates[category].map(template => (
                <Tooltip key={template.id || template.name} title={template.description}>
                  <Chip
                    icon={template.icon}
                    label={template.name}
                    onClick={() => onSelectTemplate({ ...template, iconName: template.iconName || 'TrackChangesIcon' })} // Pass iconName string
                    onDelete={category === 'My Templates' ? () => handleDeleteTemplate(template.id) : undefined}
                    clickable
                    color={category === 'My Templates' ? "primary" : "default"}
                    variant={category === 'My Templates' ? "filled" : "outlined"}
                  />
                </Tooltip>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default CategorizedBehaviorTemplates;

