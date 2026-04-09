export const CONTACT_INBOX_ADMIN_EMAILS = [
  "rentalkaushik@gmail.com",
];

export const isContactInboxAdminEmail = (email) => {
  if (!email) return false;
  return CONTACT_INBOX_ADMIN_EMAILS.includes(String(email).toLowerCase());
};
