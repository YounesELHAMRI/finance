# 📤 Guide d'Import de Relevés Bancaires

Ce guide explique comment utiliser la fonctionnalité d'import de relevés bancaires pour ajouter rapidement plusieurs dons à la fois.

## 🎯 Objectif

La fonctionnalité d'import permet d'uploader un fichier CSV ou Excel contenant vos dons déjà filtrés pour une association spécifique, et l'application va automatiquement créer tous les dons dans la base de données.

## 📋 Prérequis

Avant d'importer vos dons, assurez-vous d'avoir :
1. ✅ Créé le bénéficiaire dans l'application
2. ✅ Créé la catégorie appropriée
3. ✅ Préparé votre fichier de relevé bancaire

## 📁 Format du Fichier

### Colonnes Requises

Votre fichier doit contenir au minimum ces colonnes :

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `date` | Date du don | 15/01/2024 |
| `amount` | Montant du don | 100 |

### Colonnes Optionnelles

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `description` | Description du don | Don mensuel janvier |
| `beneficiary` | Nom du bénéficiaire | Croix-Rouge |

### Formats de Date Acceptés

- **DD/MM/YYYY** : 15/01/2024
- **DD-MM-YYYY** : 15-01-2024
- **ISO (YYYY-MM-DD)** : 2024-01-15

### Formats de Fichier Supportés

- ✅ **CSV** (.csv)
- ✅ **Excel** (.xlsx, .xls)

## 📝 Exemple de Fichier CSV

```csv
date,amount,description
15/01/2024,100,Don mensuel janvier
01/02/2024,50,Aide humanitaire urgente
15/02/2024,75,Soutien médical
01/03/2024,100,Don mensuel mars
15/03/2024,200,Don exceptionnel
```

## 🚀 Étapes d'Import

### 1. Préparer votre relevé bancaire

1. Exportez votre relevé bancaire depuis votre banque (format CSV ou Excel)
2. Filtrez les lignes pour ne garder que les dons à une association spécifique
3. Assurez-vous que les colonnes correspondent au format attendu
4. Renommez les colonnes si nécessaire : `date`, `amount`, `description`

### 2. Accéder à la page d'import

1. Ouvrez l'application : http://localhost:3000
2. Cliquez sur **"Import"** dans le menu de navigation
3. Vous arrivez sur la page d'import

### 3. Sélectionner la catégorie et le bénéficiaire

1. **Catégorie** : Choisissez la catégorie appropriée (ex: Religion, Santé, etc.)
2. **Bénéficiaire** : Sélectionnez le bénéficiaire des dons (ex: Mosquée Locale)

> ⚠️ **Important** : Tous les dons du fichier seront associés à cette catégorie et ce bénéficiaire.

### 4. Uploader le fichier

1. Cliquez sur **"Choisir un fichier"** ou glissez-déposez votre fichier
2. Le fichier doit être au format CSV ou Excel
3. Taille maximale : 10 MB

### 5. Importer les dons

1. Cliquez sur le bouton **"Importer les dons"**
2. L'application va :
   - Lire le fichier
   - Extraire les données (date, montant, description)
   - Valider les données
   - Créer les dons dans la base de données
3. Attendez la confirmation

### 6. Vérifier les résultats

Une fois l'import terminé, vous verrez :
- ✅ Le nombre de dons importés
- 📋 La liste détaillée des dons créés
- 💰 Le montant de chaque don
- 📅 La date de chaque don

## 💡 Conseils et Bonnes Pratiques

### Préparation du Fichier

1. **Nettoyez vos données** : Supprimez les lignes vides et les en-têtes inutiles
2. **Vérifiez les montants** : Assurez-vous que les montants sont des nombres positifs
3. **Uniformisez les dates** : Utilisez le même format de date partout
4. **Ajoutez des descriptions** : Cela facilite l'identification des dons plus tard

### Gestion des Erreurs

Si l'import échoue :
- ✅ Vérifiez que le fichier est au bon format (CSV ou Excel)
- ✅ Vérifiez que les colonnes `date` et `amount` existent
- ✅ Vérifiez que les dates sont dans un format valide
- ✅ Vérifiez que les montants sont des nombres positifs
- ✅ Assurez-vous d'avoir sélectionné une catégorie et un bénéficiaire

### Organisation

1. **Un fichier par bénéficiaire** : Créez un fichier séparé pour chaque association
2. **Nommage clair** : Nommez vos fichiers de manière explicite (ex: `dons-mosquee-2024.csv`)
3. **Sauvegarde** : Conservez une copie de vos fichiers originaux

## 📊 Après l'Import

Une fois vos dons importés :

1. **Vérifiez le tableau de bord** : Les statistiques sont mises à jour automatiquement
2. **Consultez la liste des dons** : Allez sur la page "Dons" pour voir tous vos dons
3. **Modifiez si nécessaire** : Vous pouvez éditer ou supprimer des dons individuellement

## 🔄 Import Régulier

Pour un suivi régulier :

1. **Mensuel** : Importez vos dons chaque mois
2. **Trimestriel** : Faites un import tous les 3 mois
3. **Annuel** : Importez tous vos dons en fin d'année

## ❓ Questions Fréquentes

### Puis-je importer des dons pour plusieurs bénéficiaires à la fois ?

Non, chaque import est associé à un seul bénéficiaire. Vous devez faire un import séparé pour chaque bénéficiaire.

### Que se passe-t-il si j'importe le même don deux fois ?

L'application créera un doublon. Il est recommandé de vérifier vos dons existants avant d'importer.

### Puis-je modifier les dons après l'import ?

Oui, vous pouvez éditer ou supprimer n'importe quel don depuis la page "Dons".

### Quel format de montant utiliser ?

Utilisez des nombres décimaux avec un point (ex: 100.50) ou des entiers (ex: 100).

### Les descriptions sont-elles obligatoires ?

Non, les descriptions sont optionnelles. Si vous ne les fournissez pas, l'application ajoutera automatiquement "Import depuis [nom du fichier]".

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez ce guide
2. Téléchargez le fichier d'exemple depuis la page d'import
3. Consultez les messages d'erreur affichés

---

**Bon import ! 🎉**