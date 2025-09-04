import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '../locales/en/common.json';
import terms from '../locales/en/terms.json';
import invite from '../locales/en/invite.json';
import nav from '../locales/en/nav.json';
import dashboard from '../locales/en/dashboard.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        common,
        terms,
        invite,
        nav,
        dashboard,
      },
    },
    ns: ['common', 'terms', 'invite', 'nav', 'dashboard'],
    defaultNS: 'common',
  });

export default i18n;
