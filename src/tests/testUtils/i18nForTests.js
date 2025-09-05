import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Mock translations for testing
const resources = {
  en: {
    terms: {
      profile_one: "profile",
      profile_other: "profiles",
      owner_one: "Care Owner",
      partner_one: "Care Partner", 
      caregiver_one: "Caregiver",
      therapist_one: "Therapist",
      team_member_one: "Team Member",
      care_team: "Care Team",
      me: "me",
      profile_name: "Profile Name",
      profile_age: "Profile Age"
    },
    common: {
      actions: {
        add: "Add",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        saving: "Saving...",
        save_changes: "Save Changes"
      },
      modal: {
        add_new: "Add New {{item}}",
        edit_item: "Edit {{item}}"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;