# Guide d’intégration Swiper – sales_args_master

Ce document est destiné à **l’agent de codage** chargé d’implémenter le carrousel
dans l’application **Next.js / React / TypeScript** du projet `sales_args_master`.

Objectif : intégrer **Swiper** de manière propre, maintenable et cohérente avec
l’architecture existante.

---

## 1. Contexte technique

- Framework : Next.js (App Router)
- Langage : TypeScript
- UI : composants React
- Données : liste dynamique d’arguments (cartes)
- Contrainte : composant **client-side uniquement**

Swiper est choisi pour :
- sa maturité
- son support mobile / desktop
- ses breakpoints natifs
- sa compatibilité Next.js

---

## 2. Installation

À exécuter à la racine du projet :

```bash
npm install swiper
```

ou

```bash
yarn add swiper
```

Aucune dépendance supplémentaire requise.

---

## 3. Règle Next.js critique

⚠️ **Swiper ne doit jamais être utilisé dans un Server Component**

Le composant React qui contient Swiper **DOIT** commencer par :

```ts
'use client'
```

---

## 4. Emplacement recommandé

Créer un composant dédié :

```
src/components/arguments/ArgumentsCarousel.tsx
```

Responsabilités :
- recevoir les données (props)
- afficher une slide = une carte
- gérer responsive + navigation

---

## 5. Imports obligatoires

```ts
'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
```

Bonnes pratiques :
- importer uniquement les modules utilisés
- importer les CSS une seule fois (dans ce composant)

---

## 6. Exemple de composant de base

```tsx
'use client'

type Argument = {
  id: string
  title: string
  description: string
}

type Props = {
  argumentsList: Argument[]
}

export function ArgumentsCarousel({ argumentsList }: Props) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Keyboard]}
      spaceBetween={16}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      keyboard={{ enabled: true }}
      breakpoints={{
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {argumentsList.map(arg => (
        <SwiperSlide key={arg.id}>
          <div className="argument-card">
            <h3>{arg.title}</h3>
            <p>{arg.description}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
```

---

## 7. Styles & layout

### Règles importantes

- Chaque `SwiperSlide` doit contenir **un conteneur pleine hauteur**
- Éviter `overflow: hidden` sur les parents
- Le design est géré par l’app, pas par Swiper

### Exemple CSS minimal

```css
.argument-card {
  height: 100%;
  padding: 16px;
  border-radius: 12px;
  background: var(--card-bg);
}
```

(Tailwind équivalent autorisé)

---

## 8. Navigation personnalisée (recommandé)

Pour un dashboard, préférer des boutons custom.

Principe :
- boutons HTML avec refs
- connecter Swiper via `onBeforeInit`

Cela permet :
- design cohérent
- meilleure accessibilité
- contrôle total

---

## 9. Données dynamiques

Swiper supporte très bien :
- listes issues d’API
- filtres
- re-render React

Contraintes :
- `key` stable sur chaque `SwiperSlide`
- éviter de recréer toute la liste inutilement

---

## 10. Accessibilité

À activer impérativement :
- `Keyboard`
- pagination cliquable
- focus visible sur les cartes

Swiper fournit déjà :
- navigation clavier
- rôles ARIA de base

---

## 11. Erreurs à éviter

❌ Utiliser Swiper dans un Server Component  
❌ Importer CSS Swiper dans un layout serveur  
❌ Mettre Swiper dans un parent `overflow: hidden`  
❌ Slides sans clé stable  

---

## 12. Checklist finale

- [ ] composant marqué `'use client'`
- [ ] Swiper isolé dans un composant dédié
- [ ] CSS importé une seule fois
- [ ] breakpoints définis
- [ ] navigation clavier activée
- [ ] clés stables sur `SwiperSlide`
- [ ] layout non bloquant

---

## 13. Objectif qualité

L’implémentation doit être :
- lisible
- testable
- évolutive (nouveaux types de cartes)
- cohérente avec le reste du dashboard

---

Fin du guide.
