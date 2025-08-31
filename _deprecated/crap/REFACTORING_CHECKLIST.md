# ChildCard Refactoring Checklist

## Pre-Refactor Testing
- [ ] Quick Entry Circles (😊😴⚡) are clickable and functional
- [ ] 3-dot menu appears for Parent/Co-Parent roles
- [ ] Edit Child button works (pencil icon next to name)
- [ ] Daily Report button functions
- [ ] Role-based styling displays correctly (border colors, backgrounds)
- [ ] Care Team + button works for adding members
- [ ] Expandable sections work (diagnosis, care team, recent activity)
- [ ] Hover effects and animations work
- [ ] Responsive behavior on mobile

## During Refactor - One Component at a Time
1. **Extract component in NEW file**
2. **Test original version still works**
3. **Replace ONE usage in original**
4. **Test that specific piece works**
5. **Commit that single change**
6. **Move to next piece**

## Post-Refactor Testing
- [ ] All above functionality still works
- [ ] No console errors
- [ ] Build succeeds
- [ ] Performance hasn't degraded
- [ ] All props are properly passed down

## Rollback Plan
- Keep `ChildCard.original.js` as backup
- Git commit before each extraction
- Use `git checkout HEAD~1 -- src/components/Dashboard/ChildCard.js` to rollback