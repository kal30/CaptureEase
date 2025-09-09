# Firestore Security Rules & Permissions Guide

> **CaptureEase Security Architecture**  
> Comprehensive guide to role-based access control, data validation, and security rules.

---

## 🎯 Overview

CaptureEase uses a sophisticated **role-based permission system** with **immutable audit trails**, **soft deletes**, and **comprehensive data validation** to ensure enterprise-grade security and compliance.

### Key Security Principles
- **Principle of Least Privilege**: Users only get access they need
- **Immutable Audit Trail**: All changes tracked with metadata
- **Soft Deletes**: No data loss, everything recoverable
- **Data Validation**: Prevents malformed data
- **Performance Optimized**: Fast queries via members array

---

## 👥 User Roles & Access Levels

| Role | Description | Access Level |
|------|-------------|--------------|
| **Care Owner** | Primary parent/guardian | Full control of child data |
| **Care Partner** | Secondary parent/partner | Create & edit own entries |
| **Caregiver** | Babysitter, nanny, etc. | Limited access to logs |
| **Therapist** | Medical professionals | Read-only clinical oversight |

---

## 📊 Permission Matrix

### **Incidents & Daily Logs** (incidents, daily_logs, journal_entries, dailyCare, follow_ups)

| Role | Create | Read | Update Own | Update Others | Soft Delete |
|------|--------|------|------------|---------------|-------------|
| **Care Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Care Partner** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Caregiver** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Therapist** | ❌ | ✅ | ❌ | ❌ | ❌ |

### **Medical Data** (medications, sideEffects, doctorVisits)

| Role | Create | Read | Update | Soft Delete |
|------|--------|------|--------|-------------|
| **Care Owner** | ✅ | ✅ | ✅ | ✅ |
| **Care Partner** | ✅ | ✅ | ❌ | ❌ |
| **Caregiver** | ❌ | ✅ | ❌ | ❌ |
| **Therapist** | ❌ | ✅ | ❌ | ❌ |

*Note: Medical data has stricter controls - only Owner can update, Care Partners can create.*

### **Child Management** (children collection)

| Role | Create Child | Read Child | Update Child | Archive Child |
|------|--------------|------------|--------------|---------------|
| **Care Owner** | ✅ | ✅ | ✅ | ✅ |
| **Care Partner** | ❌ | ✅ | ✅* | ❌ |
| **Caregiver** | ❌ | ✅ | ✅* | ❌ |
| **Therapist** | ❌ | ✅ | ✅* | ❌ |

*\* Cannot change role assignments or core metadata*

---

## 🔒 Security Rules Architecture

### **Helper Functions** (`firestore.rules` lines 66-201)

All permissions are centralized in reusable helper functions:

```javascript
// Permission Control
canCreateIncidentLogs()  // Owner, Care Partners, Caregivers (NOT Therapists)
canUpdateIncidentLogs()  // Owner edits all, others edit own (NOT Therapists)
canCreateMedical()       // Owner, Care Partners ONLY
canUpdateMedical()       // Owner ONLY (stricter control)
canReadChildData()       // All roles with child access
canSoftDelete()          // Owner only
canArchiveChild()        // Owner only

// Data Validation
hasValidIncidentLogFields()  // Validates log data structure
hasValidMedicalFields()      // Validates medical data (stricter)
isValidStatus()             // Validates status values
isValidSeverity()           // Validates incident severity
```

### **Standardized Pattern**

Every collection follows this consistent pattern:

```javascript
match /collection/{docId} {
  // CREATE: Permission + Data validation
  allow create: if canCreateX() && hasValidXFields();
  
  // READ: All roles with child access
  allow read: if canReadChildData();
  
  // UPDATE: Role-based + Soft delete + Data validation
  allow update: if (canUpdateX() && hasValidXFields()) || canSoftDelete();
}
```

---

## 🛡️ Immutable Metadata System

### **Required Fields on Every Document**

```javascript
{
  // IMMUTABLE - Set on creation, never changed
  createdBy: "user-uid",        // Who created this
  createdAt: timestamp,         // When created
  childId: "child-id",          // Which child this belongs to
  
  // AUDIT TRAIL - Updated on every change
  updatedBy: "user-uid",        // Who last updated this
  updatedAt: timestamp,         // When last updated
  
  // STATUS - For soft delete system
  status: "active" | "deleted" | "archived"
}
```

### **Metadata Validation Rules**

- ✅ **Creation**: `createdBy` must equal caller's UID
- ✅ **Updates**: `createdBy`, `createdAt`, `childId` cannot be changed
- ✅ **Audit**: `updatedBy`, `updatedAt` required on all updates
- ✅ **Timestamps**: Must use `serverTimestamp()` for consistency

---

## 📈 Performance Optimization

### **Members Array System**

Instead of complex OR queries, each child has an optimized `users.members` array:

```javascript
// OLD (Slow) - Multiple document reads
where("users.care_owner", "==", userId)
  .or(where("users.care_partners", "array-contains", userId))
  .or(where("users.caregivers", "array-contains", userId))
  .or(where("users.therapists", "array-contains", userId))

// NEW (Fast) - Single array lookup
where("users.members", "array-contains", userId)
```

### **Auto-Maintained Members Array**

The `users.members` field is automatically updated by:
- `assignCaregiver()`, `assignTherapist()`, `assignCarePartner()`
- `unassignCaregiver()`, `unassignTherapist()`
- `updateMembersField()` helper function

---

## 🗑️ Soft Delete System

### **No Hard Deletes**

CaptureEase **never** permanently deletes data. Instead:

- **Soft Delete**: Change `status` from `"active"` to `"deleted"`
- **Archive**: Change `status` from `"active"` to `"archived"`
- **Query Filtering**: Only show `status: "active"` by default

### **Benefits**

- ✅ **Data Recovery**: Deleted items can be restored
- ✅ **Audit Trail**: Complete history preserved
- ✅ **Compliance**: Meets medical data retention requirements
- ✅ **Mistake Protection**: Accidental deletes are reversible

### **Usage Examples**

```javascript
// Get active children only
const activeChildren = await getActiveChildren();

// Get archived children for audit
const archivedChildren = await getArchivedChildren();

// Archive a child (soft delete)
await archiveChild(childId);
```

---

## ✅ Data Validation Rules

### **Field Validation Types**

```javascript
// String Validation
isValidRequiredString(field, maxLength)  // Must exist, not empty
isValidOptionalString(field, maxLength)  // Can be null/empty
isValidString(field, maxLength)          // Must be valid if present

// Enum Validation  
isValidStatus(status)     // "active", "deleted", "archived"
isValidSeverity(severity) // "low", "medium", "high", "urgent"

// Type Validation
field is string           // Must be string type
field is timestamp        // Must be timestamp type
field is list            // Must be array type
```

### **Collection-Specific Validation**

**Incidents:**
- `type` (required, max 100 chars)
- `customIncidentName` (optional, max 200 chars)
- `severity` (optional, must be valid enum)
- `remedy`, `customRemedy` (optional, max 1000 chars)
- `notes` (optional, max 2000 chars)

**Medical Data:**
- `name` (required, max 200 chars)
- `type` (required, max 100 chars)
- `dosage`, `frequency`, `prescribedBy` (optional, max 200 chars)

---

## 🚀 Easy Maintenance Guide

### **Changing Access Levels**

To modify who can do what, edit the helper functions in `firestore.rules`:

```javascript
// Example: Allow therapists to create incidents
function canCreateIncidentLogs() {
  return isAuthenticated() &&
         hasValidCreateMetadata() &&
         hasChildAccess(request.auth.uid, request.resource.data.childId);
         // Remove: && !hasChildRoleForRequest('therapists')
}
```

### **Adding New Collections**

1. Follow the standardized pattern:
```javascript
match /newCollection/{docId} {
  allow create: if canCreateIncidentLogs() && hasValidFields();
  allow read: if canReadChildData();
  allow update: if (canUpdateIncidentLogs() && hasValidFields()) || canSoftDelete();
}
```

2. Create validation function:
```javascript
function hasValidNewCollectionFields() {
  let data = request.resource.data;
  return hasValidIncidentLogFields() &&
         // Add collection-specific validation
         isValidRequiredString(data.specificField, 200);
}
```

### **Adding New Validation Rules**

```javascript
// Add new validation helper
function isValidNewField(field) {
  return field in ['value1', 'value2', 'value3'];
}

// Use in collection rules
allow create: if canCreateX() && 
  hasValidXFields() && 
  isValidNewField(request.resource.data.newField);
```

---

## 🔧 Developer Usage

### **Service Function Updates**

When creating/updating documents, ensure you include required metadata:

```javascript
// CREATE Example
const docData = {
  // Your data
  type: 'incident',
  notes: 'Something happened',
  
  // REQUIRED METADATA
  childId: childId,
  createdBy: currentUser.uid,
  createdAt: serverTimestamp(),
  status: 'active'
};

// UPDATE Example  
const updateData = {
  // Your updates
  notes: 'Updated notes',
  
  // REQUIRED AUDIT FIELDS
  updatedBy: currentUser.uid,
  updatedAt: serverTimestamp()
};
```

### **Query Patterns**

```javascript
// Always filter by child and status
const q = query(
  collection(db, 'incidents'),
  where('childId', '==', childId),
  where('status', '==', 'active'),  // Only active records
  orderBy('createdAt', 'desc')
);
```

---

## 🚨 Security Best Practices

### **DO's**
- ✅ Always use `serverTimestamp()` for timestamps
- ✅ Include `childId` in all child-related documents
- ✅ Use soft deletes instead of hard deletes
- ✅ Validate data on both client and server
- ✅ Follow the standardized permission patterns

### **DON'Ts**
- ❌ Never modify `createdBy`, `createdAt`, or `childId` after creation
- ❌ Don't bypass the helper functions with custom rules
- ❌ Never hard delete documents (use soft delete)
- ❌ Don't skip metadata fields in service functions
- ❌ Avoid complex permission logic in individual collections

---

## 📋 Troubleshooting

### **Common Permission Errors**

**"Missing required fields"**
- Ensure `createdBy`, `createdAt`, `childId` are included in new documents

**"Permission denied on update"**
- Check that `updatedBy` and `updatedAt` are included
- Verify user has correct role for the operation

**"Invalid status value"**
- Use only: `"active"`, `"deleted"`, or `"archived"`

**"String too long"**
- Check field length limits in validation functions

### **Testing Permissions**

Use Firebase Auth emulator to test different user roles:

```javascript
// Test as different roles
await signInAsCaregiver();
await signInAsTherapist(); 
await signInAsCareOwner();
```

---

## 📚 Related Files

- **`firestore.rules`** - Main security rules file
- **`src/services/childService.js`** - Child management functions
- **`src/services/migrations/usersMembersMigration.js`** - Members array optimization
- **`src/services/incidents/repository.js`** - Incident CRUD operations
- **`src/services/dailyCareService.js`** - Daily care operations

---

## 🔄 Version History

- **v3.0** - Comprehensive data validation added
- **v2.0** - Child archiving and performance optimization
- **v1.0** - Role-based permissions and immutable metadata

---

*Last Updated: September 2025*  
*Security Rules Version: 3.0*