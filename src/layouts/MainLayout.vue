<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="bg-primary text-white" height-hint="32">
      <q-toolbar>
        <q-toolbar-title id="drag-area">
          <div class="brand">liliFLUX</div>
        </q-toolbar-title>
        <div class="row items-center full-height non-selectable">
          <div>
            <div class="window-btn" @click="minApp">
              <img
                class="icon"
                srcset="
                  icons/min-w-10.png,
                  icons/min-w-12.png 1.25x,
                  icons/min-w-15.png 1.5x,
                  icons/min-w-15.png 1.75x,
                  icons/min-w-20.png 2x,
                  icons/min-w-20.png 2.25x,
                  icons/min-w-24.png 2.5x,
                  icons/min-w-30.png 3x,
                  icons/min-w-30.png 3.5x
                "
                draggable="false"
              />
            </div>
          </div>
          <div>
            <div class="window-btn" @click="toggleMaximize">
              <img
                v-if="!isMaximized"
                class="icon"
                srcset="
                  icons/max-w-10.png,
                  icons/max-w-12.png 1.25x,
                  icons/max-w-15.png 1.5x,
                  icons/max-w-15.png 1.75x,
                  icons/max-w-20.png 2x,
                  icons/max-w-20.png 2.25x,
                  icons/max-w-24.png 2.5x,
                  icons/max-w-30.png 3x,
                  icons/max-w-30.png 3.5x
                "
                draggable="false"
              />
              <img
                v-else
                class="icon"
                srcset="
                  icons/restore-w-10.png,
                  icons/restore-w-12.png 1.25x,
                  icons/restore-w-15.png 1.5x,
                  icons/restore-w-15.png 1.75x,
                  icons/restore-w-20.png 2x,
                  icons/restore-w-20.png 2.25x,
                  icons/restore-w-24.png 2.5x,
                  icons/restore-w-30.png 3x,
                  icons/restore-w-30.png 3.5x
                "
                draggable="false"
              />
            </div>
          </div>
          <div>
            <div class="window-btn close" @click="closeApp">
              <img
                class="icon"
                srcset="
                  icons/close-w-10.png,
                  icons/close-w-12.png 1.25x,
                  icons/close-w-15.png 1.5x,
                  icons/close-w-15.png 1.75x,
                  icons/close-w-20.png 2x,
                  icons/close-w-20.png 2.25x,
                  icons/close-w-24.png 2.5x,
                  icons/close-w-30.png 3x,
                  icons/close-w-30.png 3.5x
                "
                draggable="false"
              />
            </div>
          </div>
        </div>
      </q-toolbar>
    </q-header>
    <!-- 
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true" -->
    <q-drawer :model-value="true" show-if-above :mini="true" :width="200" :breakpoint="500" bordered class="main-menu">
      <q-scroll-area class="fit">
        <div class="column justify-between" style="min-height: 100%">
          <div class="col">
            <q-list>
              <template v-for="(menuItem, index) in menuList" :key="index">
                <q-item clickable :active="activePage(menuItem)" :to="{ path: '/' + menuItem.url }" v-ripple>
                  <q-item-section avatar>
                    <q-icon :name="menuItem.icon" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t(menuItem.label) }}
                  </q-item-section>
                  <q-tooltip anchor="center right" self="center left" :offset="[10, 10]" class="g-black text-captionb">{{
                    $t(menuItem.label)
                  }}</q-tooltip>
                </q-item>
                <q-separator :key="'sep' + index" v-if="menuItem.separator" />
              </template>
            </q-list>
          </div>
          <div>
            <q-list>
              <template v-for="(menuItem, index) in bottomMenu" :key="index">
                <q-item clickable :active="activePage(menuItem)" :to="{ path: '/' + menuItem.url }" v-ripple>
                  <q-item-section avatar>
                    <q-icon :name="menuItem.icon" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t(menuItem.label) }}
                  </q-item-section>
                  <q-tooltip anchor="center right" self="center left" :offset="[10, 10]" class="g-black text-captionb">{{
                    $t(menuItem.label)
                  }}</q-tooltip>
                </q-item>
                <q-separator :key="'sep' + index" v-if="menuItem.separator" />
              </template>
            </q-list>
            <div class="row justify-center">
              <div class="q-px-sm app-ver">v{{ version }}</div>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <div>
          <q-scroll-area class="absolute-full" style="min-height: inherit" :visible="true" :thumb-style="thumbStyle" :bar-style="barStyle">
            <div style="min-height: inherit">
              {{ $route.name }}
              <router-view :key="$route.fullPath" />
            </div>
          </q-scroll-area>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
export default {
  data() {
    return {
      version: '0.0',
      miniState: false,
      isMaximized: false,
      menuList: [
        {
          icon: 'chat',
          label: 'run_job',
          url: 'job/history',
          separator: false,
        },
        {
          icon: 'add',
          label: 'new_workload',
          url: 'messages/new',
          separator: false,
        },
        {
          icon: 'psychology',
          label: 'workloads',
          url: 'history/user',
          separator: false,
        },
        {
          icon: 'history',
          label: 'history',
          url: 'history/history',
          separator: false,
        },
        {
          icon: 'settings',
          label: 'settings',
          url: 'settings',
          separator: false,
        },
      ],
      bottomMenu: [
        {
          icon: 'help',
          label: 'help',
          url: '',
          separator: false,
        },
      ],
      thumbStyle: {
        right: '3px',
        borderRadius: '5px',
        // backgroundColor: '#027be3',
        width: '7px',
        height: '7px',
        // opacity: 0.75
      },
      barStyle: {
        // right: '2px',
        // borderRadius: '9px',
        // backgroundColor: '#027be3',
        // width: '9px',
        // opacity: 0.2
      },
    };
  },
  computed: {
    ...mapStores(useSettingsStore),
  },
  beforeMount() {
    _electron.run('FocusedWindow:listen', { name: 'main' });
    _electron.on('Window:main:maximize', () => {
      this.isMaximized = true;
    });
    _electron.on('Window:main:unmaximize', () => {
      this.isMaximized = false;
    });
  },
  async mounted() {
    this.version = await this.settingsStore.getVersion();
  },
  methods: {
    toggleMaximize() {
      if (this.isMaximized) {
        this.unminimizeApp();
      } else {
        this.maxApp();
      }
    },
    activePage(menuItem) {
      return this.$route.path === '/' + menuItem.url;
    },
    closeApp() {
      _electron.run('FocusedWindow:close');
    },
    minApp() {
      _electron.run('FocusedWindow:minimize');
    },
    unminimizeApp() {
      _electron.run('FocusedWindow:unmaximize');
    },
    maxApp() {
      _electron.run('FocusedWindow:maximize');
    },
  },
};
</script>

<style lang="scss">
/* TODO https://www.electronjs.org/docs/latest/tutorial/window-customization
Tip: disable context menus
On some platforms, the draggable area will be treated as a non-client frame, so when you right click on it, a system menu will pop up.
To make the context menu behave correctly on all platforms, you should never use a custom context menu on draggable areas.
*/

.main-menu .q-scrollarea__content {
  display: contents;
}

.app-ver {
  font-size: 10px;
  opacity: 0.6;
}

.brand {
  padding-left: 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 16px;
}
#drag-area {
  -webkit-app-region: drag;
}
.window-btn {
  width: 46px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  color: white;
  .q-icon {
    font-weight: 100;
  }
  transition: background-color 0.2s;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.close {
    &:hover {
      background-color: #e81123;
    }
  }
}
.q-toolbar {
  min-height: 32px;
  padding: 0;
}
</style>