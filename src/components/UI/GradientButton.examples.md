# GradientButton Usage Examples

## Basic Usage

```jsx
// Primary gradient button
<GradientButton variant="gradient">
  Add Child
</GradientButton>

// Success gradient with icon
<GradientButton variant="success-gradient" startIcon={<PersonAddIcon />}>
  Invite Team Member
</GradientButton>

// Daily Care theme button
<GradientButton variant="dailyCare" elevated>
  Complete Daily Care
</GradientButton>
```

## Variants

```jsx
// Gradient buttons
<GradientButton variant="gradient" color="primary">Primary Gradient</GradientButton>
<GradientButton variant="gradient" color="success">Success Gradient</GradientButton>
<GradientButton variant="dailyCare">Daily Care Purple</GradientButton>

// Outlined buttons with hover effects
<GradientButton variant="outlined" color="success" elevated>
  Success Outlined
</GradientButton>

// Standard contained
<GradientButton variant="contained" color="primary" elevated>
  Elevated Primary
</GradientButton>

// Text buttons
<GradientButton variant="text" color="primary">
  Text Button
</GradientButton>
```

## Sizes and Props

```jsx
// Different sizes
<GradientButton size="small">Small Button</GradientButton>
<GradientButton size="medium">Medium Button</GradientButton>
<GradientButton size="large">Large Button</GradientButton>

// Full width mobile buttons
<GradientButton fullWidth variant="gradient">
  Full Width
</GradientButton>

// With elevation and icons
<GradientButton 
  variant="gradient" 
  elevated 
  startIcon={<AddIcon />}
  onClick={handleClick}
>
  Add Something
</GradientButton>
```

## Before & After Comparison

### Before (DashboardHeader.js - Complex styling)
```jsx
<StyledButton
  variant="contained"
  size="large"
  startIcon={<AddIcon />}
  onClick={() => setShowAddChildModal(true)}
  sx={{
    py: 1.5,
    px: { xs: 2, md: 3 },
    fontSize: { xs: "1rem", md: "1.1rem" },
    fontWeight: 600,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    width: { xs: "100%", sm: "auto" },
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
      transform: "translateY(-2px)",
      boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
  }}
>
  Add Child
</StyledButton>
```

### After (Clean and semantic)
```jsx
<GradientButton 
  variant="gradient" 
  size="large" 
  startIcon={<AddIcon />} 
  elevated
  onClick={() => setShowAddChildModal(true)}
>
  Add Child
</GradientButton>
```

## Daily Care Specific Examples

```jsx
// Daily care action buttons
<GradientButton variant="dailyCare" size="small">
  Daily Report
</GradientButton>

// Completion status buttons
<GradientButton 
  variant={completedToday ? "success-gradient" : "gradient"} 
  elevated
>
  {completedToday ? "Completed!" : "Complete Daily Care"}
</GradientButton>
```

## Theme Integration Benefits

When you change theme colors, **ALL GradientButton instances automatically update**:

```js
// Change this in theme/light.js
palette: {
  primary: { main: "#NEW_COLOR", dark: "#DARKER_NEW_COLOR" },
  dailyCare: { primary: "#NEW_PURPLE", dark: "#DARKER_PURPLE" }
}

// All gradient buttons instantly use the new colors
// All hover states automatically update
// All shadows use the new color variations
```

## Responsive Behavior

```jsx
// Automatically responsive sizing
<GradientButton 
  size="large"
  sx={{ 
    width: { xs: "100%", sm: "auto" },
    fontSize: { xs: "1rem", md: "1.1rem" }
  }}
>
  Responsive Button
</GradientButton>
```