import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Alert, Divider } from "@mui/material";
import { FamilyRestroom as FamilyIcon, Psychology as TherapyIcon, Person as PersonIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { sendInvitation, sendMultiChildInvitation } from "../../services/invitationService";
import { USER_ROLES, ROLE_DISPLAY } from "../../constants/roles";
import { useRole } from "../../contexts/RoleContext";
import ModalHeader from './ModalHeader';
import WarningOwnedProfiles from './WarningOwnedProfiles';
import EmailInput from './EmailInput';
import RoleSelector from './RoleSelector';
import ScopeSelector from './ScopeSelector';
import SpecializationField from './SpecializationField';
import PersonalMessageField from './PersonalMessageField';
import ModalActions from './ModalActions';

const InviteTeamMemberModal = ({
  open,
  onClose,
  children = [],
  selectedChildId = null,
  onInviteSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation(["invite", "terms", "common"]);
  const { getUserRoleForChild } = useRole();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(USER_ROLES.CARE_PARTNER);
  const [specialization, setSpecialization] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter children to only show those where user is Care Owner
  const ownedChildren = children.filter(
    (child) => getUserRoleForChild(child.id) === USER_ROLES.CARE_OWNER
  );

  // Multi-child selection state
  const [inviteAllChildren, setInviteAllChildren] = useState(true);
  const [selectedChildIds, setSelectedChildIds] = useState(new Set());

  // Initialize child selection when modal opens
  useEffect(() => {
    if (open) {
      if (selectedChildId) {
        // Modal opened from specific child section
        setInviteAllChildren(false);
        setSelectedChildIds(new Set([selectedChildId]));
      } else {
        // Modal opened from global invite button
        setInviteAllChildren(true);
        setSelectedChildIds(new Set());
      }
    }
  }, [open, selectedChildId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Determine which children to invite for (only owned profiles)
      const childrenToInviteFor = inviteAllChildren
        ? ownedChildren
        : ownedChildren.filter((child) => selectedChildIds.has(child.id));

      if (childrenToInviteFor.length === 0) {
        setError(t("invite:errorNoProfileSelected"));
        setLoading(false);
        return;
      }

      // TEMPORARY FIX: Use single invitation for now to test roles
      let result;
      let childNames;

      if (childrenToInviteFor.length === 1) {
        // Single child - use original function
        result = await sendInvitation(
          childrenToInviteFor[0].id,
          email,
          role,
          role === USER_ROLES.THERAPIST ? specialization : null,
          personalMessage || null
        );
        childNames = childrenToInviteFor[0].name;
      } else {
        // Multi-child - try the new function, fall back to single if it fails
        try {
          const childIds = childrenToInviteFor.map((child) => child.id);
          result = await sendMultiChildInvitation(
            childIds,
            email,
            role,
            role === USER_ROLES.THERAPIST ? specialization : null,
            personalMessage || null
          );
          childNames = result.children.join(", ");
        } catch (error) {
          console.error(
            "Multi-child invitation failed, falling back to single invitations:",
            error
          );
          // Fallback: Send separate invitations for each child
          const results = [];
          for (const child of childrenToInviteFor) {
            const singleResult = await sendInvitation(
              child.id,
              email,
              role,
              role === USER_ROLES.THERAPIST ? specialization : null,
              personalMessage || null
            );
            results.push(singleResult);
          }
          result = {
            status: "invited",
            message: t("invite:successInvitationSentFor", { names: childrenToInviteFor.map((c) => c.name).join(", ") }),
          };
          childNames = childrenToInviteFor.map((c) => c.name).join(", ");
        }
      }
      setSuccess(t("invite:successInvitationSentFor", { names: childNames }));

      // Clear form after successful invitation
      setTimeout(() => {
        setEmail("");
        setRole(USER_ROLES.CARE_PARTNER);
        setSpecialization("");
        setPersonalMessage("");
        setInviteAllChildren(true);
        setSelectedChildIds(new Set());
        setSuccess("");
        onInviteSuccess?.(result);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending invitation:", error);
      setError(error.message || t("invite:sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setRole(USER_ROLES.CARE_PARTNER);
      setSpecialization("");
      setPersonalMessage("");
      setError("");
      setSuccess("");
      onClose();
    }
  };

  // Get role options from constants - KISS approach
  const roleOptions = [
    {
      value: USER_ROLES.CARE_PARTNER,
      ...ROLE_DISPLAY[USER_ROLES.CARE_PARTNER],
      icon: <FamilyIcon />,
    },
    {
      value: USER_ROLES.CAREGIVER,
      ...ROLE_DISPLAY[USER_ROLES.CAREGIVER],
      icon: <PersonIcon />,
    },
    {
      value: USER_ROLES.THERAPIST,
      ...ROLE_DISPLAY[USER_ROLES.THERAPIST],
      icon: <TherapyIcon />,
    },
  ];

  const getDefaultMessage = () => {
    const childrenToInviteFor = inviteAllChildren
      ? ownedChildren
      : ownedChildren.filter((child) => selectedChildIds.has(child.id));

    if (childrenToInviteFor.length === 0) {
      return "";
    } else if (childrenToInviteFor.length === 1) {
      const childName = childrenToInviteFor[0].name;
      if (role === USER_ROLES.CAREGIVER) {
        return t("invite:defaultMessage.caregiver.single", { name: childName });
      } else {
        return t("invite:defaultMessage.therapist.single", { name: childName });
      }
    } else {
      const childNames = childrenToInviteFor.map((c) => c.name).join(", ");
      if (role === USER_ROLES.CAREGIVER) {
        return t("invite:defaultMessage.caregiver.multi", { names: childNames });
      } else {
        return t("invite:defaultMessage.therapist.multi", { names: childNames });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      maxHeight="90vh"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          display: "flex",
          alignItems: "center",
          gap: 2,
          pb: 2,
        }}
      >
        <ModalHeader />
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            p: 3,
            flex: 1,
            overflow: "auto",
            maxHeight: "calc(90vh - 200px)", // Account for header and footer
          }}
        >
          {ownedChildren.length === 0 && <WarningOwnedProfiles />}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <EmailInput email={email} setEmail={setEmail} loading={loading} />

          <RoleSelector role={role} setRole={setRole} roleOptions={roleOptions} loading={loading} />

          <ScopeSelector
            ownedChildren={ownedChildren}
            inviteAllChildren={inviteAllChildren}
            setInviteAllChildren={setInviteAllChildren}
            selectedChildIds={selectedChildIds}
            setSelectedChildIds={setSelectedChildIds}
          />

          {/* Specialization for Therapists */}
          {role === USER_ROLES.THERAPIST && (
            <SpecializationField
              specialization={specialization}
              setSpecialization={setSpecialization}
              loading={loading}
            />
          )}

          <Divider sx={{ my: 3 }} />

          {/* Personal Message */}
          <PersonalMessageField
            personalMessage={personalMessage}
            setPersonalMessage={setPersonalMessage}
            loading={loading}
            placeholder={getDefaultMessage()}
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          <ModalActions
            busy={loading}
            disabled={!email || loading || ownedChildren.length === 0}
            onCancel={handleClose}
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteTeamMemberModal;
