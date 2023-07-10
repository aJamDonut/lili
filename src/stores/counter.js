import { defineStore } from 'pinia'

export const useCounter = defineStore('counter', {
  state: () => ({
    message: 'Hello, Pinia!',
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})
