import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

import { useSettingsStore } from 'src/stores/settings';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

import { Quasar } from 'quasar';
Quasar.lang.getLocale(); // returns a string

export default boot(async ({ app }) => {
  //Uses default locale or the settings locale

  const FALLBACK_LOCALE = 'en-US'; //Falls back to US if can't find any Locale

  const defaultLocale = Quasar.lang.getLocale();

  const settings = useSettingsStore();
  await settings.load(); //TODO: is this right? The store isn't loaded yet so I need to load it...

  const setLocale = settings.language !== 'none' ? settings.language : defaultLocale;

  const i18n = createI18n({
    locale: setLocale || FALLBACK_LOCALE,
    legacy: false,
    messages,
  });

  // Set i18n instance on app
  app.use(i18n);
});
