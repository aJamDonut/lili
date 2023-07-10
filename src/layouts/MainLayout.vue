<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          LiLi
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
          <q-list>
            <template v-for="(menuItem, index) in menuList" :key="index">
              <q-item clickable :active="menuItem.label === 'Outbox'" :to="{path: '/' + menuItem.url}" v-ripple>
                <q-item-section avatar>
                  <q-icon :name="menuItem.icon" />
                </q-item-section>
                <q-item-section>
                  {{ menuItem.label }}
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index"  v-if="menuItem.separator" />
            </template>

          </q-list>
        </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <transition
        mode="out-in"
        enter-active-class="animated fadeIn fast"
        leave-active-class="animated fadeOut"
        appear
        :duration="100"
      >
        <router-view />
      </transition>
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
    separator: false
  },
  {
    icon: 'add',
    label: 'Run A Job',
    url: 'run',
    separator: false
  },
  {
    icon: 'history',
    label: 'Job History',
    url: 'history',
    separator: false
  }
]

export default {
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      menuList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
};
</script>