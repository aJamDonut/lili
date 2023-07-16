<template>
  <q-page padding>
    <lili-cont title="Settings">
      <label>{{ $t('slider_inputs') }}</label>
      <q-toggle v-model="settingsStore.sliderInputs" class="q-mb-md" />
      <br />
      <label>{{ $t('theme') }}</label>
      <q-select v-model="theme" filled :options="themeOptions" class="q-mb-md" dense />

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

      <label>{{ $t('chatgpt_key') }}</label>
      <q-input
        :type="chatGPTKeyHide ? 'password' : 'text'"
        v-model="settingsStore.chatGPTKey"
        filled
        class="q-mb-md"
        dense
      />
      <q-btn @click="validateLicense">Validate license</q-btn>
    </lili-cont>
    {{ licenseMessage }}
  </q-page>
</template>


<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
import { hasValidLicense } from '../services/lili/lili_real';

export default {
  data() {
    return {
      liliKeyHide: true,
      chatGPTKeyHide: true,
      licenseMessage: 'test',
      themeOptions: [
        {
          label: 'Light',
          value: false,
        },
        {
          label: 'Dark',
          value: true,
        },
        {
          label: 'Auto Detect',
          value: 'auto',
        },
      ],
    };
  },
  methods: {
    async validateLicense() {
      let license = await hasValidLicense();
      if (!license.valid) {
        this.licenseMessage = license.reason;
      } else {
        this.licenseMessage = 'License is valid';
      }
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
};
</script>
