import { watch, nextTick, onBeforeUnmount, type Ref } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

// Fenêtre modale accessible : focus déplacé à l'ouverture, Tab confiné, Échap ferme, focus rendu à la fermeture.
// `alsoReachable` : sélecteur d'éléments affichés par-dessus la modale qui restent atteignables au clavier (bandeau cookies).
export function useDialog(el: Ref<HTMLElement | null>, open: Ref<boolean>, close: () => void, alsoReachable?: string) {
  let previous: HTMLElement | null = null

  function onKeydown(e: KeyboardEvent) {
    if (!open.value || !el.value) return
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key !== 'Tab') return
    const zones = [el.value, ...(alsoReachable ? document.querySelectorAll<HTMLElement>(alsoReachable) : [])]
    const items = zones.flatMap(z => [...z.querySelectorAll<HTMLElement>(FOCUSABLE)]).filter(n => n.offsetParent !== null)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    const inside = zones.some(z => z.contains(active))
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(open, async (isOpen) => {
    if (isOpen) {
      previous = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      el.value?.querySelector<HTMLElement>('[autofocus], ' + FOCUSABLE)?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      previous?.focus?.()
      previous = null
    }
  }, { immediate: true })

  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
