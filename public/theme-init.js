// Applique le thème choisi avant le premier rendu (script bloquant, externe pour respecter la CSP).
try {
  var t = localStorage.getItem('en-theme')
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t
} catch (e) { /* stockage indisponible : thème du système */ }
