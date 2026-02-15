import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { blogPosts } from '../../content/blog';
import BlogCard from '../../components/Blog/BlogCard';

const BlogList = () => {
  // Sort posts by date descending
  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, background: '-webkit-linear-gradient(45deg, #4338CA, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Latest Updates
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          News, product updates, and thoughts on parenting from the CaptureEase team.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {sortedPosts.map((post) => (
          <Grid item key={post.slug} xs={12} sm={6} md={4}>
            <BlogCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BlogList;
