# Documentation Complète - Projet E-Doctor App

## Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Fonctionnalités](#fonctionnalités)
5. [Composants Principaux](#composants-principaux)
6. [Gestion des Données](#gestion-des-données)
7. [Intégration API](#intégration-api)
8. [Déploiement et Configuration](#déploiement-et-configuration)
9. [Guide de Développement](#guide-de-développement)

---

## Vue d'Ensemble

### Présentation du Projet
**E-Doctor App** est une application web moderne de gestion de pharmacie développée avec les technologies les plus récentes. L'application permet aux pharmaciens de gérer efficacement leur inventaire, traiter les commandes patients, et administrer leur officine numérique.

### Objectifs Principaux
- ✅ Gestion complète des produits pharmaceutiques
- ✅ Traitement des ordonnances et commandes
- ✅ Interface utilisateur moderne et intuitive
- ✅ Architecture évolutive et maintenable
- ✅ Intégration avec système backend existant

### Technologies Utilisées
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| Next.js | 16.1.6 | Framework React full-stack |
| React | 19.2.3 | Bibliothèque d'interface utilisateur |
| TypeScript | 5+ | Typage statique |
| Tailwind CSS | 4+ | Framework CSS utilitaire |
| Bootstrap | 5+ | Composants UI additionnels |

---

## Architecture Technique

### Architecture Globale
```
┌─────────────────────────────────────────────────────────────┐
│                    E-Doctor App                              │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js App Router)                              │
│  ├── Pages (app/)                                           │
│  ├── Components (/components)                              │
│  ├── Hooks (/hooks)                                         │
│  └── Utils (/lib)                                           │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── React Hooks (useState, useEffect)                     │
│  ├── Custom Hooks (useProducts)                             │
│  └── Local Storage (Persistance)                           │
├─────────────────────────────────────────────────────────────┤
│  Styling                                                    │
│  ├── Tailwind CSS                                           │
│  ├── Bootstrap 5                                            │
│  └── Custom CSS                                             │
├─────────────────────────────────────────────────────────────┤
│  External Libraries                                         │
│  ├── Grid.js (Tableaux)                                    │
│  ├── SweetAlert2 (Notifications)                            │
│  ├── Flatpickr (Date Picker)                                │
│  └── Waves.js (Animations)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Patterns Architecture
- **Component-Based Architecture** : Composants réutilisables
- **Custom Hooks Pattern** : Logique métier séparée
- **Client-Side Rendering** : Interface dynamique
- **LocalStorage First** : Persistance locale

---

## Structure du Projet

### Arborescence Complète
```
e-doctor_app/
├── app/                          # Pages Next.js (App Router)
│   ├── layout.tsx               # Layout racine
│   ├── page.jsx                  # Page d'accueil
│   ├── products/
│   │   └── page.tsx             # Gestion produits
│   ├── orders/
│   │   └── page.tsx             # Gestion commandes
│   ├── login/
│   │   └── page.tsx             # Connexion
│   ├── profile/
│   │   └── page.tsx             # Profil pharmacie
│   ├── validate-order/
│   │   └── page.tsx             # Scanner commandes
│   ├── add-product/
│   │   └── page.tsx             # Ajouter produit
│   ├── create_pharmacy/
│   │   └── page.tsx             # Créer pharmacie
│   ├── globals.css              # Styles globaux
│   └── favicon.ico              # Icône site
├── components/                   # Composants React
│   ├── layout/
│   │   ├── Header.tsx           # En-tête application
│   │   ├── Sidebar.tsx          # Navigation latérale
│   │   └── Footer.tsx           # Pied de page
│   ├── products/                # Composants produits
│   └── orders/                  # Composants commandes
├── hooks/                       # Hooks personnalisés
│   └── useProducts.ts           # Gestion produits
├── lib/                         # Utilitaires
│   ├── products.js              # Bibliothèque tableaux
│   └── api/                     # Fonctions API
├── data/                        # Données de test
│   └── officine_informations.md # Info pharmacies test
├── public/                      # Fichiers statiques
│   ├── images/                  # Images et logos
│   ├── css/                     # Styles additionnels
│   ├── js/                      # Scripts JavaScript
│   └── libs/                    # Bibliothèques externes
├── styles/                      # Styles personnalisés
├── context/                     # Context React (vide)
├── scripts/                     # Scripts de build
├── .env.local/                  # Variables environnement
├── package.json                 # Dépendances
├── tsconfig.json               # Configuration TypeScript
├── next.config.ts              # Configuration Next.js
├── tailwind.config.js          # Configuration Tailwind
├── eslint.config.mjs           # Configuration ESLint
└── README.md                   # Documentation projet
```

### Fichiers de Configuration

#### package.json
```json
{
  "name": "e-doctor_app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  }
}
```

#### tsconfig.json
Configuration TypeScript pour le typage statique et la sécurité du code.

---

## Fonctionnalités

### 1. Gestion des Produits 📦

#### Fonctionnalités CRUD
- **Création** : Ajout de nouveaux produits avec validation
- **Lecture** : Affichage détaillé avec recherche et filtrage
- **Mise à jour** : Modification des informations produit
- **Suppression** : Retrait sécurisé avec confirmation

#### Attributs Produit
```typescript
interface Product {
  id: string;              // Identifiant unique
  productId: string;       // Code produit (PRD001)
  name: string;            // Nom du médicament
  galenic: string;         // Forme galénique
  unit?: string;           // Unité de vente
  expirationDate?: string; // Date d'expiration
  price?: number;          // Prix d'achat
  salePrice?: number;      // Prix de vente
  purchasePrice?: number;  // Prix d'achat
  currency: string;        // Devise (FCFA)
  stock: number;           // Quantité en stock
  category?: string;       // Catégorie thérapeutique
  description?: string;    // Description
}
```

#### Fonctionnalités Avancées
- 🔍 **Recherche** : Par nom, code produit, catégorie
- 📊 **Statistiques** : Stock total, valeur inventaire
- 🏷️ **Catégories** : Antalgique, Antibiotique, etc.
- ⚠️ **Alertes** : Stock faible, expiration proche

### 2. Gestion des Commandes 🛒

#### Workflow Commande
```
Patient → Crée commande → Pharmacien reçoit → Validation → Traitement → Livraison
```

#### États Commande
| État | Description | Action |
|------|-------------|--------|
| PENDING | En attente de validation | Scanner/Valider |
| APPROVED | Validée, en préparation | Préparer produits |
| REJECTED | Refusée | Notification patient |
| COMPLETED | Terminée/livrée | Archiver |
| CANCELLED | Annulée | Historique |

#### Fonctionnalités
- 📱 **Scanner** : Validation ordonnance par QR code
- 💳 **Paiement** : Suivi statut payé/non payé
- 📦 **Préparation** : Liste produits à assembler
- 🚚 **Livraison** : Suivi et confirmation

### 3. Interface Utilisateur 🎨

#### Header Complet
- **Logo** : Branding pharmacie
- **Recherche** : Barre de recherche globale
- **Notifications** : Alertes commandes nouvelles
- **Profil** : Informations pharmacie, déconnexion
- **Thème** : Mode clair/sombre
- **Plein écran** : Mode immersion

#### Sidebar Navigation
```
📊 Dashboards
├── 💰 Ventes
└── 🏥 Pharmacie
    ├── 📦 Produits
    ├── 🛒 Commandes  
    ├── ⚙️ Paramètres pharmacie
    └── 📱 Scanner une commande
```

#### Design Responsive
- 📱 **Mobile** : Navigation adaptée
- 💻 **Desktop** : Interface complète
- 🎨 **Thème** : Personnalisable
- ✨ **Animations** : Transitions fluides

### 4. Authentification 🔐

#### Sécurité
- **Connexion** : Téléphone + mot de passe
- **Session** : Token localStorage
- **Déconnexion** : Nettoyage complet
- **Protection** : Routes sensibles

#### Données Pharmacie
```typescript
interface PharmacyInfo {
  name: string;
  telephone: string;
  address: {
    city: string;
    street: string;
    quarter: string;
    postalBox: string;
  };
  description: string;
  pharmacist: {
    name: string;
    email: string;
    role: string;
  };
}
```

---

## Composants Principaux

### 1. Header.tsx - En-tête Application

**Responsabilités :**
- Affichage logo et branding
- Barre de recherche globale
- Notifications temps réel
- Menu profil utilisateur
- Contrôles thème et plein écran

**Fonctionnalités Clés :**
```typescript
// État local pour informations pharmacie
const [officineName, setOfficineName] = useState('');
const [officineNumber, setOfficineNumber] = useState('');

// Chargement depuis localStorage
useEffect(() => {
  const name = localStorage.getItem('officine_name') || 'Pharmacie';
  const number = localStorage.getItem('officine_number') || '';
  setOfficineName(name);
  setOfficineNumber(number);
}, []);

// Déconnexion sécurisée
const handleLogout = () => {
  localStorage.clear();
  window.location.href = '/login';
};
```

### 2. Sidebar.tsx - Navigation Latérale

**Structure Menu :**
- Navigation principale hiérarchique
- Menu déroulant "Pharmacie" avec sous-menus
- Indicateurs de page active
- Contrôles thème et déconnexion

**Fonctionnalités :**
```typescript
// Détection page active
const isActive = (path: string) => {
  return pathname === path ? 'active' : '';
};

// Menu navigation
const menuItems = [
  { path: '/products', label: 'Produits', icon: '📦' },
  { path: '/orders', label: 'Commandes', icon: '🛒' },
  { path: '/profile', label: 'Paramètres', icon: '⚙️' },
];
```

### 3. useProducts.ts - Hook Gestion Produits

**Architecture Hook :**
```typescript
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonnalités CRUD
  const addProduct = async (productData: AddProductData) => { /* ... */ };
  const updateProduct = async (productId: string, updates: Partial<Product>) => { /* ... */ };
  const deleteProduct = async (productId: string) => { /* ... */ };
  
  // Utilitaires
  const searchProducts = (query: string) => { /* ... */ };
  const filterByCategory = (category: string) => { /* ... */ };
  
  return { products, loading, error, addProduct, updateProduct, deleteProduct, searchProducts, filterByCategory };
}
```

**Avantages :**
- 🔄 **Réutilisabilité** : Logique centralisée
- 🎯 **Testabilité** : Isolé des composants
- 📦 **Encapsulation** : État local géré
- 🚀 **Performance** : Optimisations React

### 4. Layout Principal (layout.tsx)

**Configuration :**
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-nav-layout="vertical" data-header-styles="transparent">
      <body>
        <div className="page">
          {children}
        </div>
        {/* Scripts externes */}
        <Script src="/js/main.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
```

**Imports CSS :**
- Bootstrap 5
- Tailwind CSS  
- Waves.js (animations)
- SimpleBar (scrollbar)
- Flatpickr (date picker)
- SweetAlert2 (notifications)

---

## Gestion des Données

### 1. Stockage Local (LocalStorage)

**Structure Données :**
```javascript
// Produits
localStorage.setItem('pharmacy_products', JSON.stringify(products));

// Informations pharmacie
localStorage.setItem('officine_name', pharmacyName);
localStorage.setItem('officine_number', phoneNumber);

// Session utilisateur
localStorage.setItem('user_token', authToken);
```

**Avantages :**
- 💾 **Persistance** : Données conservées
- ⚡ **Performance** : Accès rapide
- 🔄 **Offline** : Fonctionnement sans connexion
- 🛡️ **Sécurité** : Isolé par domaine

### 2. Données Mockées

**Exemple Produits :**
```typescript
const mockProducts: Product[] = [
  {
    id: '1',
    productId: 'PRD001',
    name: 'Paracétamol 500mg',
    galenic: 'Comprimé',
    unit: 'Boîte',
    price: 2500,
    currency: 'FCFA',
    stock: 150,
    category: 'Antalgique',
    description: 'Traitement de la douleur et de la fièvre',
  },
  // ... autres produits
];
```

### 3. État Application

**Gestion État :**
```typescript
// État loading
const [loading, setLoading] = useState<boolean>(true);

// État erreur
const [error, setError] = useState<string | null>(null);

// État données
const [products, setProducts] = useState<Product[]>([]);
```

---

## Intégration API

### 1. Architecture API Future

**Endpoints Prévus :**
```typescript
// Produits
GET    /api/products              // Lister produits
POST   /api/products              // Créer produit
PUT    /api/products/:id         // Modifier produit
DELETE /api/products/:id         // Supprimer produit

// Commandes
GET    /api/orders                // Lister commandes
POST   /api/orders                // Créer commande
PUT    /api/orders/:id/validate   // Valider commande

// Authentification
POST   /api/auth/login            // Connexion
POST   /api/auth/logout           // Déconnexion
GET    /api/auth/profile          // Profil utilisateur
```

### 2. Informations API (officine_informations.md)

**Exemples Endpoints :**
```javascript
// Récupérer commandes pharmacie
{{baseURL}}/api/v1/officine/:pharmacyId/list-officine-orders-pending/

// Détails commande
{{baseURL}}/api/v1/officine-order/:orderId/items-order/

// Valider commande
{{baseURL}}/api/v1/officine-order/:orderId/validate-officine-order/
```

**Format Retour API :**
```json
{
  "id": "378745be-bb4f-4ce7-be0e-46a3f423178f",
  "order": {
    "id": "85420bc1-7950-48a7-872d-5ff73a9ee653",
    "patient": {
      "id": "1285e78e-378f-4f1e-8ef8-5ba322528219",
      "last_name": null,
      "first_name": null
    },
    "prescription": "/media/prescription/1.png",
    "total_amount": "0.0000",
    "status": "PENDING",
    "payment_status": "UNPAID"
  },
  "pharmacy": {
    "id": "79cfe21a-a20b-4ef0-a20c-df080aa43f1c",
    "name": "PHARMACIE 1",
    "telephone": "+237657901985"
  }
}
```

### 3. Migration vers API

**Étapes Migration :**
1. **Remplacer** localStorage par appels API
2. **Gérer** états loading/erreur
3. **Implémenter** rafraîchissement automatique
4. **Ajouter** gestion offline
5. **Optimiser** performances (cache, pagination)

---

## Déploiement et Configuration

### 1. Configuration Build

**Scripts package.json :**
```json
{
  "scripts": {
    "dev": "next dev",           // Développement
    "build": "next build",       // Build production
    "start": "next start",       // Serveur production
    "lint": "eslint"             // Analyse code
  }
}
```

### 2. Déploiement Vercel (Recommandé)

**Configuration :**
```bash
# Installation dépendances
npm install

# Build production
npm run build

# Déploiement Vercel
vercel --prod
```

**Avantages Vercel :**
- ⚡ **Performance** : CDN mondial
- 🔄 **CI/CD** : Déploiement automatique
- 📊 **Analytics** : Monitoring intégré
- 🛡️ **Sécurité** : HTTPS automatique

### 3. Variables Environnement

**.env.local :**
```bash
# API Backend
NEXT_PUBLIC_API_URL=https://api.e-doctor.com

# Configuration
NEXT_PUBLIC_APP_NAME=E-Doctor App
NEXT_PUBLIC_VERSION=1.0.0

# Authentification
JWT_SECRET=your-secret-key
```

### 4. Optimisation Performance

**Next.js Optimizations :**
- 🖼️ **Image Optimization** : next/image
- 🗜️ **Code Splitting** : Automatic
- 📦 **Bundle Analysis** : webpack-bundle-analyzer
- ⚡ **Caching** : ISR/SSR strategies

---

## Guide de Développement

### 1. Installation et Démarrage

**Prérequis :**
- Node.js 18+
- npm ou yarn
- Éditeur de code (VS Code recommandé)

**Installation :**
```bash
# Cloner projet
git clone <repository-url>
cd e-doctor_app

# Installer dépendances
npm install

# Démarrer développement
npm run dev
```

**Accès Application :**
- 🌐 **URL** : http://localhost:3000
- 📱 **Mobile** : Responsive automatique
- 🔧 **Hot Reload** : Changements temps réel

### 2. Structure Développement

**Convention Fichiers :**
- 📁 **Components** : PascalCase (Header.tsx)
- 📁 **Pages** : kebab-case (products/page.tsx)
- 📁 **Hooks** : camelCase préfixé "use" (useProducts.ts)
- 📁 **Utils** : camelCase (apiHelpers.ts)

**TypeScript Standards :**
```typescript
// Interfaces exportées
export interface Product {
  id: string;
  name: string;
}

// Types exportés  
export type ProductStatus = 'ACTIVE' | 'INACTIVE';

// Fonctions typées
export const createProduct = async (data: CreateProductData): Promise<Product> => {
  // Implementation
};
```

### 3. Bonnes Pratiques

**Code Quality :**
- ✅ **TypeScript strict** : Typage complet
- ✅ **ESLint** : Code quality
- ✅ **Prettier** : Formatting consistent
- ✅ **Comments** : Documentation API

**Performance :**
- ⚡ **React.memo** : Composants optimisés
- ⚡ **useCallback/useMemo** : Hooks optimisés
- ⚡ **Lazy loading** : Code splitting
- ⚡ **Virtual scrolling** : Grandes listes

**Sécurité :**
- 🔒 **Input validation** : Formulaires sécurisés
- 🔒 **XSS protection** : Sanitization
- 🔒 **CSRF tokens** : Requêtes sécurisées
- 🔒 **Environment variables** : Secrets protégés

### 4. Testing

**Tests Unitaires :**
```typescript
// Exemple test produit
import { render, screen } from '@testing-library/react';
import { useProducts } from '@/hooks/useProducts';

test('should add product successfully', async () => {
  const { result } = renderHook(() => useProducts());
  
  const productData = {
    name: 'Test Product',
    galenic: 'Comprimé',
    // ... autres champs
  };
  
  const response = await result.current.addProduct(productData);
  expect(response.success).toBe(true);
});
```

**Tests E2E :**
- 🧪 **Cypress** : Tests end-to-end
- 🧪 **Playwright** : Multi-browser testing
- 🧪 **Storybook** : Component testing

### 5. Debugging

**Outils Debug :**
- 🔍 **React DevTools** : Component inspection
- 🔍 **Redux DevTools** : State monitoring
- 🔍 **Network tab** : API calls
- 🔍 **Console logging** : Debug information

**Common Issues :**
- ❌ **Hydration errors** : Server/client mismatch
- ❌ **Memory leaks** : Cleanup useEffect
- ❌ **Performance** : Unnecessary re-renders
- ❌ **Type errors** : TypeScript strict

---

## Conclusion

E-Doctor App représente une solution moderne et complète pour la gestion de pharmacies. Avec son architecture basée sur Next.js, React et TypeScript, elle offre :

### ✅ Points Forts
- **Architecture moderne** : Technologies récentes et maintenable
- **Interface intuitive** : UX/UI optimisée pour pharmaciens
- **Fonctionnalités complètes** : CRUD produits, gestion commandes
- **Évolutivité** : Préparation intégration API backend
- **Performance** : Optimisations Next.js intégrées

### 🚀 Évolutions Possibles
- **Intégration API** : Connexion backend complète
- **Mobile App** : Version native React Native
- **Advanced Analytics** : Tableaux de bord détaillés
- **Multi-pharmacy** : Gestion chaines pharmacies
- **AI Integration** : Recommendations, prédictions

### 📈 Impact Business
- **Efficacité** : Réduction temps gestion
- **Précision** : Moins d'erreurs humaines
- **Traçabilité** : Historique complet
- **Conformité** : Normes pharmaceutiques
- **Scalabilité** : Croissance sans limite

---

## 🐍 Guide d'Intégration Django REST Framework + Next.js

### 📋 Prérequis

#### Backend Django
- ✅ Django REST Framework installé
- ✅ API endpoints créés
- ✅ CORS configuré
- ✅ JWT authentication implémenté

#### Frontend Next.js
- ✅ Projet Next.js configuré
- ✅ TypeScript installé
- ✅ Structure de base prête

---

## ÉTAPE 1: Configuration Backend Django

### 1.1 Installer les dépendances Django
```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install django-environ
```

### 1.2 Configurer settings.py
```python
# settings.py

INSTALLED_APPS = [
    # ... apps existantes
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'pharmacy',  # Votre app pharmacie
]

# Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js development
    "https://votre-domaine.com",  # Production
]

CORS_ALLOW_CREDENTIALS = True

# Configuration REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# Configuration JWT
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
}
```

### 1.3 Créer les serializers
```python
# pharmacy/serializers.py
from rest_framework import serializers
from .models import Pharmacy, Product, Order

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = '__all__'
```

### 1.4 Créer les vues API
```python
# pharmacy/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models Pharmacy, Product, Order
from .serializers import ProductSerializer, OrderSerializer

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(pharmacy=self.request.user.pharmacy)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(pharmacy=self.request.user.pharmacy)

    @action(detail=True, methods=['post'])
    def validate_order(self, request, pk=None):
        order = self.get_object()
        order.status = 'APPROVED'
        order.save()
        return Response({'status': 'Order validated'})
```

### 1.5 Configurer les URLs
```python
# pharmacy/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
]
```

### 1.6 Créer l'authentification JWT
```python
# users/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    telephone = request.data.get('telephone')
    password = request.data.get('password')
    
    user = authenticate(username=telephone, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'telephone': user.telephone,
                'email': user.email,
                'pharmacy': {
                    'id': user.pharmacy.id,
                    'name': user.pharmacy.name,
                    'telephone': user.pharmacy.telephone
                }
            }
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
```

---

## ÉTAPE 2: Configuration Frontend Next.js

### 2.1 Créer les variables d'environnement
Créer le fichier `.env.local` à la racine du projet Next.js :
```bash
# URL de votre API Django
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Debug mode
NEXT_PUBLIC_DEBUG_API=true
```

### 2.2 Créer la configuration API
Créer le fichier `lib/api/config.ts` :
```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  timeout: 10000,
};

// Endpoints Django REST Framework
export const DJANGO_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/api/users/login/',
    REFRESH: '/api/users/token/refresh/',
    LOGOUT: '/api/users/logout/',
  },
  
  // Pharmacies
  PHARMACY: {
    INFO: (pharmacyId: string) => `/api/v1/pharmacies/${pharmacyId}/`,
    UPDATE: (pharmacyId: string) => `/api/v1/pharmacies/${pharmacyId}/`,
  },
  
  // Produits (Django ViewSet)
  PRODUCTS: {
    LIST: '/api/v1/products/',
    CREATE: '/api/v1/products/',
    DETAIL: (id: string) => `/api/v1/products/${id}/`,
    UPDATE: (id: string) => `/api/v1/products/${id}/`,
    DELETE: (id: string) => `/api/v1/products/${id}/`,
  },
  
  // Commandes (Django ViewSet)
  ORDERS: {
    LIST: '/api/v1/orders/',
    CREATE: '/api/v1/orders/',
    DETAIL: (id: string) => `/api/v1/orders/${id}/`,
    UPDATE: (id: string) => `/api/v1/orders/${id}/`,
    DELETE: (id: string) => `/api/v1/orders/${id}/`,
    VALIDATE: (id: string) => `/api/v1/orders/${id}/validate_order/`,
  },
};
```

### 2.3 Créer le client HTTP pour Django
Créer `lib/api/django-client.ts` :
```typescript
import { API_CONFIG, DJANGO_ENDPOINTS } from './config';

interface DjangoResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
}

class DjangoApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokensToStorage(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}${DJANGO_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokensToStorage(data.access, this.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<DjangoResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Si token expiré, essayer de rafraîchir
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Méthodes HTTP
  async get<T>(endpoint: string): Promise<DjangoResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<DjangoResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<DjangoResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<DjangoResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentification
  async login(telephone: string, password: string) {
    const response = await this.post('/api/users/login/', {
      telephone,
      password,
    });

    if (response.access && response.refresh) {
      this.saveTokensToStorage(response.access, response.refresh);
    }

    return response;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export const djangoClient = new DjangoApiClient();
```

---

## ÉTAPE 3: Services Django

### 3.1 Service Authentification
Créer `lib/api/django-auth.ts` :
```typescript
import { djangoClient } from './django-client';

export interface DjangoLoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    telephone: string;
    email: string;
    pharmacy: {
      id: string;
      name: string;
      telephone: string;
    };
  };
}

export const djangoAuthService = {
  async login(telephone: string, password: string) {
    try {
      const response = await djangoClient.login(telephone, password);
      
      // Sauvegarder infos utilisateur
      if (response.user) {
        localStorage.setItem('user_data', JSON.stringify(response.user));
        localStorage.setItem('pharmacy_data', JSON.stringify(response.pharmacy));
      }
      
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  },

  logout() {
    djangoClient.logout();
    localStorage.removeItem('user_data');
    localStorage.removeItem('pharmacy_data');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  getCurrentPharmacy() {
    const pharmacyData = localStorage.getItem('pharmacy_data');
    return pharmacyData ? JSON.parse(pharmacyData) : null;
  },
};
```

### 3.2 Service Produits Django
Créer `lib/api/django-products.ts` :
```typescript
import { djangoClient } from './django-client';
import { DJANGO_ENDPOINTS } from './config';
import { Product, AddProductData } from '@/hooks/useProducts';

export const djangoProductsService = {
  async getProducts() {
    try {
      const response = await djangoClient.get<Product[]>(DJANGO_ENDPOINTS.PRODUCTS.LIST);
      return { success: true, data: response.results || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products' 
      };
    }
  },

  async createProduct(productData: AddProductData) {
    try {
      const response = await djangoClient.post<Product>(
        DJANGO_ENDPOINTS.PRODUCTS.CREATE, 
        productData
      );
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create product' 
      };
    }
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    try {
      const response = await djangoClient.put<Product>(
        DJANGO_ENDPOINTS.PRODUCTS.UPDATE(productId), 
        updates
      );
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update product' 
      };
    }
  },

  async deleteProduct(productId: string) {
    try {
      await djangoClient.delete(DJANGO_ENDPOINTS.PRODUCTS.DELETE(productId));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete product' 
      };
    }
  },
};
```

---

## ÉTAPE 4: Mise à Jour des Composants

### 4.1 Modifier la page de login
Créer/Mettre à jour `app/login/page.tsx` :
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { djangoAuthService } from '@/lib/api/django-auth';

export default function LoginPage() {
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await djangoAuthService.login(telephone, password);
    
    if (response.success) {
      router.push('/products');
    } else {
      setError(response.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Connexion Pharmacie</h3>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Téléphone</label>
            <input
              type="tel"
              className="form-control"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 4.2 Modifier useProducts hook
Mettre à jour `hooks/useProducts.ts` :
```typescript
// Remplacer les imports existants
import { djangoProductsService } from '@/lib/api/django-products';

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await djangoProductsService.getProducts();
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: AddProductData) => {
    try {
      setLoading(true);
      const response = await djangoProductsService.createProduct(productData);
      
      if (response.success && response.data) {
        setProducts(prev => [...prev, response.data!]);
        return { success: true, product: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    } finally {
      setLoading(false);
    }
  };

  // Similar pattern pour updateProduct et deleteProduct...
}
```

---

## ÉTAPE 5: Procédures de Déploiement

### 5.1 Développement Local

#### Backend Django
```bash
# 1. Activer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# 4. Démarrer le serveur
python manage.py runserver 0.0.0.0:8000
```

#### Frontend Next.js
```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur de développement
npm run dev
```

### 5.2 Test de Connexion
```bash
# Tester l'API Django
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"telephone": "+237699281439", "password": "votre_mot_de_passe"}'

# Tester depuis le navigateur
# Ouvrir http://localhost:3000 et essayer de se connecter
```

### 5.3 Déploiement Production

#### Backend Django (Production)
```bash
# 1. Configurer les variables d'environnement
export DEBUG=False
export ALLOWED_HOSTS="votre-domaine.com,www.votre-domaine.com"
export CORS_ALLOWED_ORIGINS="https://votre-domaine.com"

# 2. Collecter les fichiers statiques
python manage.py collectstatic --noinput

# 3. Utiliser Gunicorn pour la production
pip install gunicorn
gunicorn votre_projet.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend Next.js (Production)
```bash
# 1. Mettre à jour .env.local pour la production
NEXT_PUBLIC_API_BASE_URL=https://votre-api-backend.com

# 2. Build de production
npm run build

# 3. Démarrer le serveur de production
npm start
```

---

## ÉTAPE 6: Dépannage et Debug

### 6.1 Problèmes Courants

#### CORS Errors
```python
# Vérifier la configuration CORS dans settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://votre-domaine.com",
]

# Ajouter aussi pour le développement
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```

#### JWT Token Issues
```typescript
// Vérifier que le token est bien sauvegardé
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
```

#### Django Serializer Errors
```python
# Ajouter des validations dans les serializers
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'price': {'min_value': 0},
        }
```

### 6.2 Monitoring

#### Logs Django
```python
# Ajouter dans settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

#### Logs Frontend
```typescript
// Ajouter dans django-client.ts
private async request<T>(endpoint: string, options: RequestInit = {}) {
  console.log(`[API Request] ${options.method} ${endpoint}`, {
    headers: options.headers,
    body: options.body,
  });
  
  // ... reste du code
}
```

---

## ÉTAPE 7: Checklist de Validation

### 7.1 Backend Django ✅
- [ ] REST Framework installé
- [ ] CORS configuré
- [ ] JWT authentication implémenté
- [ ] ViewSets créés
- [ ] Serializers validés
- [ ] URLs configurées
- [ ] Permissions définies

### 7.2 Frontend Next.js ✅
- [ ] Variables d'environnement configurées
- [ ] Client API Django créé
- [ ] Services implémentés
- [ ] Hooks mis à jour
- [ ] Composants modifiés
- [ ] Gestion erreurs ajoutée

### 7.3 Tests d'Intégration ✅
- [ ] Login fonctionne
- [ ] CRUD produits fonctionne
- [ ] CRUD commandes fonctionne
- [ ] Token refresh fonctionne
- [ ] Errors gérés correctement
- [ ] Production déployée

---

*Documentation générée le 7 février 2026 - Projet E-Doctor App v0.1.0*
