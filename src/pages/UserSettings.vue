<template>
  <q-page padding>
    <lili-cont title="settings">
      <label>{{ $t('slider_inputs') }}</label>
      <q-toggle v-model="settingsStore.sliderInputs" class="q-mb-md" />
      <br />
      <label>{{ $t('theme') }}</label>
      <q-select v-model="theme" filled :options="themeOptions" class="q-mb-md" dense />
      <label>{{ $t('language') }}</label>
      <q-select
        v-model="locale"
        :options="localeOptions"
        filled
        class="q-mb-md"
        borderless
        emit-value
        map-options
        options-dense
      />

      <label>{{ $t('chatgpt_key') }}</label>
      <q-input
        :type="chatGPTKeyHide ? 'password' : 'text'"
        v-model="settingsStore.chatGPTKey"
        filled
        class="q-mb-md"
        dense
      />
    </lili-cont>
    <br />
    <lili-cont title="license">
      <label>{{ $t('lili_license_key') }}</label>
      <q-input
        :type="liliKeyHide ? 'password' : 'text'"
        v-model="settingsStore.liliKey"
        filled
        class="q-mb-md"
        dense
      >
        <template v-slot:append>
          <q-icon
            :name="liliKeyHide ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="liliKeyHide = !liliKeyHide"
          />
        </template>
      </q-input>
      <div class="outcome q-mb-xs">
        <div v-if="settingsStore.isValidKey === true" class="output-positive">
          <div class="row justify-start">
            <div><q-icon name="check" /></div>
            <div>{{ $t('license_valid') }}</div>
          </div>
        </div>
        <div v-else class="output-negative">
          <div class="row items-center q-col-gutter-xs">
            <div><q-icon name="close" size="20px" /></div>
            <div>{{ $t('license_invalid') }}</div>
          </div>
        </div>
      </div>
    </lili-cont>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
import { hasValidLicense } from '../services/lili/lili_real';
import { information, error } from '../boot/lili';
import { useI18n } from 'vue-i18n';
import { langCodesList } from '../i18n/index';

export default {
  data() {
    const { locale } = useI18n({ useScope: 'global' });

    const locales = [];

    for (const countryCode in langCodesList) {
      locales.push({ value: countryCode, label: langCodesList[countryCode] });
    }

    return {
      locale,
      localeOptions: locales,
      liliKeyHide: true,
      chatGPTKeyHide: true,
      licenseMessage: 'test',
      themeOptions: [
        {
          label: 'light',
          value: false,
        },
        {
          label: 'dark',
          value: true,
        },
        {
          label: 'auto_detect',
          value: 'auto',
        },
      ],
    };
  },
  methods: {
    async validateLicense() {
      console.log('validatingLicense');
      const isValid = await this.settingsStore.checkKey();

      console.log('isValid', isValid);

      // error(license.reason);
      // information('License is valid');
    },
  },
  computed: {
    ...mapStores(useSettingsStore),
    theme: {
      get() {
        return {
          value: this.settingsStore.darkMode,
          label: this.themeOptions.find((x) => x.value === this.settingsStore.darkMode).label,
        };
      },
      set(val) {
        this.settingsStore.darkMode = val.value;
      },
    },
  },
  watch: {
    '$i18n.locale': function (newLanguage) {
      this.settingsStore.language = newLanguage;
    },
    'settingsStore.liliKey': function () {
      console.log('lili key changed');
      this.validateLicense();
    },
  },
};
</script>
