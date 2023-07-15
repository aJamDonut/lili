<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> liliFLUX </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      :model-value="true"
      show-if-above
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      :width="200"
      :breakpoint="500"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item clickable :active="false" :to="{ path: '/' + menuItem.url }" v-ripple>
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue';

const menuList = [
  {
    icon: 'dashboard',
    label: 'Dashboard',
    url: '',
    separator: false,
  },
  {
    icon: 'add',
    label: 'Run A Job',
    url: 'job',
    separator: false,
  },
  {
    icon: 'history',
    label: 'Job History',
    url: 'history',
    separator: true,
  },
  {
    icon: 'settings',
    label: 'Settings',
    url: 'settings',
    separator: false,
  },
];

export default {
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      miniState: ref(true),
      menuList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
};
</script>