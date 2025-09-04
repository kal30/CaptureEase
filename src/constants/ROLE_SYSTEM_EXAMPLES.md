# New Role System Usage Examples

## Quick Start Guide

### 1. Import Constants
```javascript
import { 
  USER_ROLES, 
  PERMISSIONS, 
  LOG_VISIBILITY,
  roleHasPermission,
  canViewLog 
} from '../constants/roles';
```

### 2. Check Permissions
```javascript
// Simple permission check
if (roleHasPermission(userRole, PERMISSIONS.ADD_DAILY_LOGS)) {
  // Show add log button
}

// Check if user can invite others
if (roleHasPermission(userRole, PERMISSIONS.INVITE_CARE_PARTNER)) {
  // Show invite modal
}
```

### 3. Log Visibility Control
```javascript
import { LogVisibilitySelector } from '../components/UI/LogVisibilitySelector';

// In your log form component:
const [visibility, setVisibility] = useState(LOG_VISIBILITY.EVERYONE);

<LogVisibilitySelector
  value={visibility}
  onChange={setVisibility}
  userRole={userRole}
  compact={false} // false = prominent, true = collapsed by default
/>
```

### 4. Transfer Ownership
```javascript
import { TransferOwnershipModal } from '../components/UI/TransferOwnershipModal';

// Only show for Care Owners
{userRole === USER_ROLES.CARE_OWNER && (
  <TransferOwnershipModal
    open={showTransferModal}
    onClose={() => setShowTransferModal(false)}
    childId={childId}
    childName={childName}
    teamMembers={teamMembers}
    currentOwnerId={currentUserId}
    onTransferSuccess={(result) => {
      console.log(`Ownership transferred to ${result.newOwnerName}`);
      refreshTeamData();
    }}
  />
)}
```

### 5. Role-Based UI
```javascript
// Show different content based on role
const renderActions = () => {
  switch (userRole) {
    case USER_ROLES.CARE_OWNER:
      return <OwnerActions />;
    case USER_ROLES.CARE_PARTNER:
      return <PartnerActions />;
    case USER_ROLES.CAREGIVER:
      return <CaregiverActions />;
    case USER_ROLES.THERAPIST:
      return <TherapistActions />;
    default:
      return <NoAccessMessage />;
  }
};
```

## Role Hierarchy (by permissions):

1. **Care Owner** 👑
   - Full control (create/edit/delete child)
   - Manage team (invite/remove members)
   - Transfer ownership
   - All log permissions
   - Export reports

2. **Care Partner** 👨‍👩‍👧‍👦  
   - Add/view all logs
   - Edit own logs
   - View analytics & reports
   - Export reports
   - NO team management

3. **Caregiver** 👤
   - Add daily logs
   - View shared logs only
   - Edit own logs
   - NO analytics or reports

4. **Therapist** 🩺
   - View all logs (read-only)
   - Add professional notes only
   - View analytics & reports
   - Export reports (if allowed)
   - NO daily log creation

## Log Visibility Rules:

- **Everyone** (default): All team members see
- **Family Only**: Care Owner + Care Partners only
- **Owner Only**: Care Owner only  
- **Therapist Notes**: Care Owner + Therapists (+ Partners if enabled)

### Special Rules:
- Caregivers NEVER see Family-Only or Owner-Only logs
- Therapist access to Family-Only logs controlled by Owner setting
- Log creators can always see their own logs
- Care Owner can see ALL logs regardless of visibility

## Migration from Old Roles:

- `primary_parent` → `care_owner`
- `co_parent` → `care_partner`
- `family_member` → `care_partner`
- `caregiver` → `caregiver` (unchanged)
- `therapist` → `therapist` (unchanged)

Migration is handled automatically by the service layer.