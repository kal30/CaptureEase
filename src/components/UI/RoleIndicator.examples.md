# RoleIndicator Usage Examples

## Basic Usage

```jsx
// Badge variants (most common)
<RoleIndicator role="therapist" variant="badge" />
<RoleIndicator role="caregiver" variant="badge" size="small" />
<RoleIndicator role="primary_parent" variant="badge" size="large" />

// Header banner (like in ChildCard)
<RoleIndicator 
  role="therapist" 
  variant="header" 
  childName="Emma" 
/>

// Compact inline display
<RoleIndicator role="caregiver" variant="compact" />
```

## Role Types Supported

```jsx
// All supported roles with their styling
<RoleIndicator role="therapist" variant="badge" />        // 🩺 Blue
<RoleIndicator role="caregiver" variant="badge" />        // 🤗 Orange  
<RoleIndicator role="primary_parent" variant="badge" />   // 👑 Green
<RoleIndicator role="co_parent" variant="badge" />        // 👨‍👩‍👧‍👦 Primary theme
<RoleIndicator role="family_member" variant="badge" />    // 👵 Calendar accent
```

## Variants

### Badge Variant (Chip-style)
```jsx
// Standard badge
<RoleIndicator role="therapist" variant="badge" />

// Small badge without label
<RoleIndicator 
  role="caregiver" 
  variant="badge" 
  size="small" 
  showLabel={false} 
/>

// Large badge with custom styling
<RoleIndicator 
  role="primary_parent" 
  variant="badge" 
  size="large"
  sx={{ borderRadius: 2 }}
/>
```

### Header Variant (Banner-style)
```jsx
// Full header with child name
<RoleIndicator 
  role="therapist" 
  variant="header" 
  childName="Emma Thompson" 
/>

// Header without child name
<RoleIndicator 
  role="caregiver" 
  variant="header" 
  showIcon={false}
/>
```

### Compact Variant (Inline)
```jsx
// Compact with icon and label
<RoleIndicator role="therapist" variant="compact" />

// Icon only
<RoleIndicator 
  role="caregiver" 
  variant="compact" 
  showLabel={false} 
/>

// Label only  
<RoleIndicator 
  role="primary_parent" 
  variant="compact" 
  showIcon={false} 
/>
```

## Size Variations

```jsx
// Small (condensed labels)
<RoleIndicator role="therapist" size="small" />    // Shows "Therapist"

// Medium (default)
<RoleIndicator role="therapist" size="medium" />   // Shows "Clinical Therapist"

// Large (full labels)
<RoleIndicator role="therapist" size="large" />    // Shows "Clinical Therapist"
```

## Before & After Comparison

### Before (ChildCard.js - 70+ lines of role styling)
```jsx
<Box
  style={{
    background: userRole === "therapist"
      ? "linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)"
      : userRole === "caregiver"
        ? "linear-gradient(90deg, #FFF3E0 0%, #FFCC80 100%)"
        : userRole && userRole.includes("parent")
          ? "linear-gradient(90deg, #E8F5E8 0%, #C8E6C9 100%)"
          : "linear-gradient(90deg, #f5f5f5 0%, #eeeeee 100%)",
    color: userRole === "therapist"
      ? "#1565C0"
      : userRole === "caregiver"
        ? "#EF6C00" 
        : userRole && userRole.includes("parent")
          ? "#2E7D32"
          : "#666",
    // ... 50+ more lines
  }}
>
  <Box component="span" style={{ fontSize: "20px" }}>
    {userRole === "therapist" ? "🩺" : userRole === "caregiver" ? "🤗" : "👑"}
  </Box>
  <Box component="span">{roleLabel}</Box>
  <Box component="span">{child.name}</Box>
</Box>
```

### After (2 lines)
```jsx
<RoleIndicator 
  role={userRole} 
  variant="header" 
  childName={child.name} 
/>
```

## Integration with Existing Components

### Replace UserRoleBadge usage
```jsx
// Old
<UserRoleBadge role="THERAPIST" />

// New
<RoleIndicator role="therapist" variant="badge" />
```

### Use in Cards and Lists
```jsx
// In child cards
<RoleIndicator role="primary_parent" variant="header" childName="Emma" />

// In team member lists  
<RoleIndicator role="caregiver" variant="compact" size="small" />

// In navigation or headers
<RoleIndicator role="therapist" variant="badge" />
```

## Theme Integration Benefits

When you change theme colors, **ALL RoleIndicator instances automatically update**:

```js
// Change this in theme/light.js
palette: {
  primary: { main: "#NEW_COLOR" }
}

// All co_parent and primary theme role indicators update
// All gradients automatically use new colors  
// All hover states use theme variations
```

## Custom Styling

```jsx
// Custom colors while maintaining consistency
<RoleIndicator 
  role="therapist"
  variant="badge"
  sx={{
    borderRadius: 3,
    fontWeight: 700,
    '&:hover': {
      transform: 'scale(1.05)'
    }
  }}
/>
```