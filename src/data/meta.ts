// Date de la dernière vérification du contenu (recommandations de l'onglet « Se protéger », comportement
// des navigateurs, explications). À mettre à jour à chaque relecture : elle s'affiche dans le pied de page
// et dans l'onglet « Se protéger ».
export const CONTENT_REVIEWED = '2026-11-20'

export const CONTENT_REVIEWED_LABEL = new Date(`${CONTENT_REVIEWED}T12:00:00Z`)
  .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
