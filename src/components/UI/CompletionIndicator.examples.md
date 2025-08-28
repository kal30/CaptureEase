# CompletionIndicator Usage Examples

## Basic Usage

```jsx
// Status dots (most common in ChildCard)
<CompletionIndicator 
  variant="dots" 
  status={{mood: true, sleep: false, energy: true}} 
/>

// Clickable completion circles
<CompletionIndicator 
  variant="circle" 
  isCompleted={true} 
  label="Mood" 
  onClick={handleClick}
/>

// Completion badge with count
<CompletionIndicator 
  variant="badge" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood', 'energy']}
  label="Daily Care"
/>

// Progress bar
<CompletionIndicator 
  variant="progress" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood']}
  label="Daily Progress"
/>
```

## Variants

### Dots Variant (Status Indicators)
```jsx
// From status object
<CompletionIndicator 
  variant="dots" 
  status={{mood: true, sleep: false, energy: true}} 
/>

// From arrays
<CompletionIndicator 
  variant="dots" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood', 'energy']}
/>

// With count display
<CompletionIndicator 
  variant="dots" 
  status={{mood: true, sleep: false, energy: true}} 
  showCount={true}
/>

// Different sizes
<CompletionIndicator variant="dots" size="small" status={{mood: true}} />
<CompletionIndicator variant="dots" size="medium" status={{mood: true}} />
<CompletionIndicator variant="dots" size="large" status={{mood: true}} />
```

### Circle Variant (Interactive Buttons)
```jsx
// Completed state
<CompletionIndicator 
  variant="circle" 
  isCompleted={true} 
  label="Mood completed"
  onClick={handleMoodClick}
/>

// Pending state
<CompletionIndicator 
  variant="circle" 
  isCompleted={false} 
  label="Sleep pending"
  onClick={handleSleepClick}
/>

// Different sizes with custom colors
<CompletionIndicator 
  variant="circle" 
  size="large"
  color="success"
  isCompleted={true}
/>
```

### Badge Variant (Summary Display)
```jsx
// Daily care summary
<CompletionIndicator 
  variant="badge" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood', 'energy']}
  label="Daily Care"
/>

// All completed (shows sparkle)
<CompletionIndicator 
  variant="badge" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood', 'sleep', 'energy']}
  label="Complete!"
/>

// Custom color theme
<CompletionIndicator 
  variant="badge" 
  items={['task1', 'task2']}
  completedItems={['task1']}
  color="primary"
  label="Tasks"
/>
```

### Progress Variant (Progress Bar)
```jsx
// With label
<CompletionIndicator 
  variant="progress" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood']}
  label="Daily Care Progress"
/>

// Without label
<CompletionIndicator 
  variant="progress" 
  items={['task1', 'task2', 'task3']}
  completedItems={['task1', 'task2']}
/>

// Large progress bar
<CompletionIndicator 
  variant="progress" 
  size="large"
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood', 'energy']}
/>
```

## Color Themes

```jsx
// Daily Care purple (default)
<CompletionIndicator variant="dots" status={{mood: true}} color="dailyCare" />

// Theme colors
<CompletionIndicator variant="circle" color="primary" isCompleted={true} />
<CompletionIndicator variant="circle" color="success" isCompleted={true} />
<CompletionIndicator variant="circle" color="warning" isCompleted={true} />

// Custom Daily Care integration
<CompletionIndicator 
  variant="badge" 
  items={['mood', 'sleep', 'energy']}
  completedItems={['mood']}
  color="dailyCare"
  label="Daily Care"
/>
```

## Before & After Comparison

### Before (ChildCard.js - Repetitive status dots)
```jsx
{/* Individual completion indicators */}
<Box sx={{ display: "flex", gap: 0.25 }}>
  {status.mood && (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: theme.palette.dailyCare.primary,
      }}
    />
  )}
  {status.sleep && (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: theme.palette.dailyCare.primary,
      }}
    />
  )}
  {status.energy && (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: theme.palette.dailyCare.primary,
      }}
    />
  )}
</Box>
```

### After (Clean and semantic)
```jsx
<CompletionIndicator 
  variant="dots" 
  status={status} 
  color="dailyCare" 
/>
```

## Integration Examples

### ChildCard Integration
```jsx
// Replace status dots in ChildCard
<CompletionIndicator 
  variant="dots" 
  status={{mood: status.mood, sleep: status.sleep, energy: status.energy}} 
/>

// Quick entry circles
<CompletionIndicator 
  variant="circle" 
  isCompleted={status.mood}
  label="Mood check"
  onClick={(e) => onQuickEntry(child, 'mood', e)}
/>
```

### Dashboard Summary
```jsx
// Child completion summary
<CompletionIndicator 
  variant="badge" 
  items={dailyCareItems}
  completedItems={completedItems}
  label={`${child.name}'s Daily Care`}
/>

// Overall progress
<CompletionIndicator 
  variant="progress" 
  items={allChildren}
  completedItems={completedChildren}
  label="Family Progress Today"
/>
```

## Theme Integration Benefits

When you change theme colors, **ALL CompletionIndicator instances automatically update**:

```js
// Change this in theme/light.js
palette: {
  dailyCare: { primary: "#NEW_PURPLE" },
  success: { main: "#NEW_GREEN" }
}

// All daily care indicators use new purple
// All success indicators use new green
// All alpha variations automatically calculated
```

## Custom Styling

```jsx
// Custom styling while maintaining functionality
<CompletionIndicator 
  variant="dots"
  status={{mood: true, sleep: false}}
  sx={{
    p: 1,
    borderRadius: 2,
    bgcolor: 'background.paper'
  }}
/>

// Responsive sizing
<CompletionIndicator 
  variant="circle"
  sx={{
    width: { xs: 24, md: 32 },
    height: { xs: 24, md: 32 }
  }}
/>
```