# Sova's Bags

Un module Foundry VTT complet et modulaire pour le système **D&D 5e** (version 6.0.0+ / règles révisées 2024).

**Sova's Bags** est conçu comme un sac d'aventurier inépuisable, regroupant une vaste collection de contenu sur-mesure pour D&D 2024 :
- **Sous-classes** (Subclasses)
- **Classes**
- **Objets magiques, armes et armures** (Items & Equipment)
- **Aptitudes et Dons** (Features)
- **Sorts** (Spells)
- **Compagnons, invocations et monstres** (Actors)

---

## Contenu Actuel

### 🛡️ Sous-classe : Oathbreaker (Briseur de Serment - Paladin 2024)
- **Classe** : Paladin (Progression 2024 à partir du niveau 3).
- **Dogmes du Briseur de Serment** :
  - *La peur est un outil aux mains des puissants.*
  - *Quête de puissance à tout prix.*
  - *Faites ce qui doit être fait, sans perdre votre objectif de vue.*

#### Progression des Aptitudes :
- **Niveau 3 : Conjure Undead** (Conduit de Divinité)
  - Action Bonus : Invoque un nombre de squelettes ou de zombis égal à $\lceil \text{CHA} / 2 \rceil$ (min 1) pendant 1 minute.
- **Niveau 3 : Dreadful Aspect** (Conduit de Divinité)
  - Déclenché immédiatement après avoir lancé *Divine Smite*. Émanation de 30 pieds : les créatures choisies doivent réussir un jet de sauvegarde de Sagesse contre le DD des sorts sous peine d'être effrayées pendant 1 minute.
- **Niveau 3 à 17 : Sorts du Serment préparés d'office (Oath Spells)** :
  - Niveau 3 : *Hellish Rebuke*, *Witch Bolt*
  - Niveau 5 : *Crown of Madness*, *Darkness*
  - Niveau 9 : *Fear*, *Summon Undead*
  - Niveau 13 : *Blight*, *Phantasmal Killer*
  - Niveau 17 : *Contagion*, *Steel Wind Strike*
- **Niveau 7 : Aura of Hate**
  - Vous et vos alliés fiélons ou morts-vivants situés dans votre *Aura of Protection* bénéficiez d'un bonus aux jets de dégâts de corps-à-corps égal à votre modificateur de Charisme.
- **Niveau 15 : Supernatural Resistance**
  - Résistance passive aux dégâts contondants, perforants et tranchants.
- **Niveau 20 : Dread Lord**
  - Action Bonus, 10 minutes (1/Repos Long ou emplacement de niveau 5).
  - Ténèbres magiques dans l'Aura de Protection à travers lesquelles vous et vos alliés voyez parfaitement.
  - 4d10 dégâts psychiques pour toute créature effrayée commençant son tour dans l'aura.
  - **Shadow Strike** : Attaque de sort de mêlée (action bonus) infligeant 3d10 + Charisme en dégâts nécrotiques.

---

## Packs de Compendiums Inclus

| Nom du Pack | Type | Description |
|---|---|---|
| `sovas-bags-subclasses` | Item | Sous-classes personnalisées (Oathbreaker, etc.) |
| `sovas-bags-classes` | Item | Classes personnalisées |
| `sovas-bags-features` | Item | Aptitudes de classe, dons et capacités spéciales |
| `sovas-bags-items` | Item | Armes, armures, objets merveilleux et consommables |
| `sovas-bags-spells` | Item | Sorts personnalisés et sorts de domaine 2024 |
| `sovas-bags-actors` | Actor | PNJ, monstres, invocations et familiers |

---

## Installation

Dans le gestionnaire de modules de Foundry VTT :
1. Rendez-vous dans **Modules complémentaires** > **Installer un module**.
2. Dans le champ **URL du manifeste**, collez l'URL suivante :
   ```
   https://raw.githubusercontent.com/Sovahless/sovas-bags/main/module.json
   ```
3. Cliquez sur **Installer**.

---

## Développement & Ajout de Contenu

Pour ajouter de nouveaux éléments au module :
1. Déposez vos fichiers JSON dans le dossier approprié sous `src/` (`src/items/`, `src/classes/`, `src/subclasses/`, etc.).
2. Exécutez simplement la commande de build :
   ```bash
   node build.mjs
   ```
   Les compendiums LevelDB sous `packs/` seront automatiquement mis à jour et prêts à l'emploi dans Foundry !

## Auteur
Développé par **Sovahless**.
