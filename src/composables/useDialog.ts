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
    // Tab entièrement géré : les zones peuvent être éloignées dans le DOM (bandeau cookies hors de la modale).
    e.preventDefault()
    const i = items.indexOf(document.activeElement as HTMLElement)
    const next = i < 0 ? (e.shiftKey ? items.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + items.length) % items.length
    items[next].focus()
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
