# Reusable UI Components

## 🎯 **Goal: Theme-Driven Design**
Change theme colors in **one place** → **ALL components automatically update**

## ✅ **New Theme-Driven Components**

### 1. **ThemeCard** - Consistent Card Styling
- **Purpose**: Replace 200+ lines of duplicate card styling
- **Variants**: `basic`, `role`, `completion`, `modal`
- **Features**: Role-based colors, hover effects, completion states

```jsx
// Before: 50+ lines of sx props
<Card sx={{...complex styling...}}>

// After: 1 clean line
<ThemeCard variant="role" roleType="therapist" elevated>
```

### 2. **GradientButton** - All Button Patterns  
- **Purpose**: Replace duplicate gradient/button styling
- **Variants**: `gradient`, `outlined`, `contained`, `dailyCare`
- **Features**: Auto-gradients from theme, elevation, responsive sizing

```jsx
// Before: 25+ lines of gradient styling
<Button sx={{background: 'linear-gradient(...)', '&:hover': {...}}}>

// After: Simple and semantic
<GradientButton variant="gradient" elevated>
```

### 3. **RoleIndicator** - Role-Based Styling
- **Purpose**: Replace 70+ lines of role condition styling
- **Variants**: `header`, `badge`, `compact`
- **Features**: All role types, consistent icons/colors

```jsx
// Before: Complex role conditionals
{userRole === "therapist" ? "🩺" : userRole === "caregiver" ? "🤗" : "👑"}

// After: Clean and maintainable
<RoleIndicator role={userRole} variant="header" childName={child.name} />
```

### 4. **CompletionIndicator** - Status & Progress
- **Purpose**: Replace repetitive status dot patterns
- **Variants**: `dots`, `circle`, `badge`, `progress`
- **Features**: Flexible completion display, theme colors

```jsx
// Before: Repetitive status boxes
{status.mood && <Box sx={{width: 6, height: 6, bgcolor: '#6D28D9'}} />}

// After: Flexible and reusable
<CompletionIndicator variant="dots" status={status} color="dailyCare" />
```

## 📊 **Impact Summary**

| Component | Lines Saved | Files Affected | Theme Integration |
|-----------|-------------|----------------|-------------------|
| ThemeCard | ~200 | 15+ | ✅ Full |
| GradientButton | ~150 | 8+ | ✅ Full |
| RoleIndicator | ~100 | 5+ | ✅ Full |
| CompletionIndicator | ~80 | 10+ | ✅ Full |
| **Total** | **~530** | **38+** | **100%** |

## 🎨 **Theme Integration**

All components automatically use theme colors:

```js
// Change this in theme/light.js
palette: {
  dailyCare: { primary: "#NEW_PURPLE" },
  primary: { main: "#NEW_COLOR" }
}

// ALL components instantly update:
// ✅ All ThemeCards use new colors
// ✅ All GradientButtons generate new gradients  
// ✅ All RoleIndicators update styling
// ✅ All CompletionIndicators change colors
```

## 📁 **Usage**

```jsx
// Import all at once
import { 
  ThemeCard, 
  GradientButton, 
  RoleIndicator, 
  CompletionIndicator 
} from '../components/UI';

// Or individually
import ThemeCard from '../components/UI/ThemeCard';
```

## 🔄 **Migration Guide**

1. **Replace Cards**: Look for `<Card sx={{...}}` → Use `<ThemeCard>`
2. **Replace Buttons**: Look for gradient styling → Use `<GradientButton>`
3. **Replace Roles**: Look for role conditionals → Use `<RoleIndicator>`
4. **Replace Status**: Look for status dots → Use `<CompletionIndicator>`

## 📚 **Documentation**

Each component has detailed examples:
- `ThemeCard.examples.md`
- `GradientButton.examples.md` 
- `RoleIndicator.examples.md`
- `CompletionIndicator.examples.md`

## 🧹 **Legacy Components** 

Consider migrating from:
- `StyledButton` → `GradientButton`
- `UserRoleBadge` → `RoleIndicator` 
- `StatusIndicator` → `CompletionIndicator`
- Custom Card styling → `ThemeCard`