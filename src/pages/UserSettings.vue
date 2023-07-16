<template>
  <q-page padding>
    <lili-cont title="Settings">
      <label>{{ $t('slider_inputs') }}</label>
      <q-toggle v-model="settingsStore.sliderInputs" class="q-mb-md" />
      <br />
      <label>{{ $t('theme') }}</label>
      <q-select v-model="theme" filled :options="themeOptions" class="q-mb-md" dense />

      <label>{{ $t('chatgpt_key') }}</label>
      <q-input
        :type="chatGPTKeyHide ? 'password' : 'text'"
        v-model="settingsStore.chatGPTKey"
        filled
        class="q-mb-md"
        dense
      />
    </lili-cont>

    <lili-cont title="License">
      <label>{{ $t('lili_key') }}</label>
      <q-input
        :type="liliKeyHide ? 'password' : 'text'"
        v-model="settingsStore.liliKey"
        filled
        class="q-mb-md"
        dense>
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
            <div>License is valid</div>
          </div>
        </div>
        <div v-else class="output-negative">
          <div class="row items-center q-col-gutter-xs">
            <div><q-icon name="close" size="20px" /></div>
            <div>License is invalid</div>
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

      console.log('validatingLicense')
      const isValid = await this.settingsStore.checkKey();

      console.log('isValid', isValid)
    
      // error(license.reason);
      // information('License is valid');

    }
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
    'settingsStore.liliKey': function () {
      console.log('lili key changed')
      this.validateLicense();
    },
  }
};
</script>
