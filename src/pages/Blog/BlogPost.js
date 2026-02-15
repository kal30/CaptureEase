import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Chip, Button, CircularProgress, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material'; // Removed CalendarMonth as it caused duplicate prop error
import ReactMarkdown from 'react-markdown';
import { blogPosts } from '../../content/blog';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const post = blogPosts.find(p => p.slug === slug);

  useEffect(() => {
    if (post) {
      setLoading(true);
      fetch(post.contentPath)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load blog post", err);
          setLoading(false);
        });
    }
  }, [post]);

  if (!post) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Post not found</Typography>
        <Button onClick={() => navigate('/blog')} sx={{ mt: 2 }}>Back to Blog</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/blog')}
        sx={{ mb: 4, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
      >
        Back to Updates
      </Button>

      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
        {post.title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {post.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ 
          '& h1': { fontSize: '2rem', fontWeight: 700, mt: 4, mb: 2 },
          '& h2': { fontSize: '1.75rem', fontWeight: 600, mt: 4, mb: 2 },
          '& h3': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 1.5 },
          '& p': { fontSize: '1.1rem', lineHeight: 1.7, mb: 2, color: 'text.primary' },
          '& ul, & ol': { mb: 2, pl: 4 },
          '& li': { mb: 1, fontSize: '1.1rem', lineHeight: 1.7 },
          '& img': { maxWidth: '100%', height: 'auto', borderRadius: 8, my: 2 },
          '& blockquote': { borderLeft: '4px solid #E0E7FF', pl: 2, my: 3, fontStyle: 'italic', color: 'text.secondary' }
        }}>
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </Box>
      )}
    </Container>
  );
};

export default BlogPost;
