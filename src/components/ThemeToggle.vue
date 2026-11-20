<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Passer au thème clair' : theme === 'light' ? 'Passer au thème sombre' : 'Changer de thème'"
    :title="theme === 'dark' ? 'Thème clair' : 'Thème sombre'"
    @click="toggle"
  >
    <span aria-hidden="true">{{ theme === 'dark' ? '☀' : theme === 'light' ? '☾' : '◐' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { currentTheme, setTheme, type Theme } from '../utils/theme'

// Null au rendu serveur (pages pré-rendues) : le thème n'est connu qu'au montage.
const theme = ref<Theme | null>(null)
onMounted(() => { theme.value = currentTheme() })

function toggle() {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  theme.value = next
}
</script>
