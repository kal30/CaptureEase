import React from 'react';
import { Card, CardContent, Typography, Chip, Box, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const BlogCard = ({ post }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(`/blog/${post.slug}`)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 2 }}
      >
        <Box sx={{ width: '100%', mb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
             {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          {post.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {post.summary}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 'auto' }}>
          {post.tags.map(tag => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              sx={{ 
                bgcolor: theme.palette.primary.light, 
                color: theme.palette.primary.contrastText,
                fontWeight: 500,
                fontSize: '0.75rem' 
              }} 
            />
          ))}
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default BlogCard;
