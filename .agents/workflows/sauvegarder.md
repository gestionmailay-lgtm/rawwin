---
description: Sauvegarde le projet sur GitHub en exécutant add, commit et push.
---
// turbo-all

1. Analyse le contexte de la conversation ou utilise `git status` pour comprendre quels ont été les derniers changements.
2. Formule un court message de commit descriptif (par exemple "Sauvegarde : mise à jour des composants"). Si l'utilisateur a fourni un détail, utilise-le.
3. Exécute la commande suivante avec `run_command` pour tout compiler en une seule étape (utilise PowerShell compatible `;`) :
   `git add . ; git commit -m "Ton message" ; git push`
4. Réponds à l'utilisateur pour confirmer que la sauvegarde a été effectuée avec succès.
