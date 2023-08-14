<template>
  <q-page padding>
    <lili-title :title="$t('settings')" />
    <lili-cont :title="$t('chat_preferences')">
      <div class="row q-col-gutter-md explainer">
        <div class="col-11 explain">
          <p>
            <b>{{ $t('enable_slider_inputs') }}</b>
            <br />{{ $t('enable_slider_inputs_describe') }}
          </p>
        </div>
        <div class="col-1 toggle">
          <q-toggle v-model="settingsStore.sliderInputs" class="q-mb-md" />
        </div>
      </div>

      <div class="row q-col-gutter-md explainer">
        <div class="col-11 explain">
          <p>
            <b>{{ $t('show_nice_params') }}</b>
            <br />{{ $t('show_nice_params_describe') }}
          </p>
        </div>
        <div class="col-1 toggle">
          <q-toggle v-model="settingsStore.show_nice_params" class="q-mb-md" />
        </div>
      </div>
    </lili-cont>

    <br />
    <lili-cont :title="$t('workspace_preferences')">
      <div class="row q-col-gutter-md explainer">
        <div class="col-11 explain">
          <p>
            <b>{{ $t('enable_file_context') }}</b>
            <br />{{ $t('enable_file_context_describe') }}
          </p>
        </div>
        <div class="col-1 toggle">
          <q-toggle v-model="settingsStore.workspace_context_files" class="q-mb-md" />
        </div>
      </div>
      <div class="row q-col-gutter-md explainer">
        <div class="col-11 explain">
          <p>
            <b>{{ $t('enable_tree_context') }}</b>
            <br />{{ $t('enable_tree_context_describe') }}
          </p>
        </div>
        <div class="col-1 toggle">
          <q-toggle v-model="settingsStore.workspace_context_tree" class="q-mb-md" />
        </div>
      </div>
    </lili-cont>
    <br />

    <lili-cont :title="$t('user_preferences')">
      <label>{{ $t('theme') }}</label>
      <q-select v-model="theme" filled :options="themeOptions" class="q-mb-md" dense />
      <label>{{ $t('language') }}</label>
      <q-select v-model="locale" :options="localeOptions" filled class="q-mb-md" borderless emit-value map-options options-dense dense />
    </lili-cont>
    <br />
    <lili-cont :title="$t('keys')">
      <label>{{ $t('chatgpt_key') }}</label>
      <q-input :type="chatGPTKeyHide ? 'password' : 'text'" v-model="settingsStore.chatGPTKey" filled class="q-mb-md" dense />
      <label>{{ $t('lili_license_key') }}</label>
      <q-input :type="liliKeyHide ? 'password' : 'text'" v-model="settingsStore.liliKey" filled class="q-mb-md" dense>
        <template v-slot:append>
          <q-icon :name="liliKeyHide ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="liliKeyHide = !liliKeyHide" />
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
    <br />

    <lili-cont title="Manage Data">
      <q-btn :label="$t('delete_all_history')" color="red" @click="purgeHistory" />
      <br />
      <br />
      <p>
        <i>{{ $t('purge_history') }}</i>
      </p>
    </lili-cont>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
import { useI18n } from 'vue-i18n';
import { langCodesList } from '../i18n/index';
import { useJobStore } from 'stores/job';

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
          label: this.$t('light'),
          value: false,
        },
        {
          label: this.$t('dark'),
          value: true,
        },
        {
          label: this.$t('auto_detect'),
          value: 'auto',
        },
      ],
    };
  },
  methods: {
    purgeHistory() {
      this.$q
        .dialog({
          title: 'Delete All History',
          message: 'Are you sure you want to delete all history?',
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.jobStore.purgeHistory();
        });
    },
    async validateLicense() {
      console.log('validatingLicense');
      const isValid = await this.settingsStore.checkKey();

      console.log('isValid', isValid);

      // error(license.reason);
      // information('License is valid');
    },
  },
  computed: {
    ...mapStores(useSettingsStore, useJobStore),
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

<style scoped>
.explainer {
  /*max-width: 1240px;*/
}
</style>