# 🚀 DÉPLOIEMENT HALALSCORE SUR VERCEL

## ÉTAPE 1: CRÉER LA STRUCTURE

1. Crée un nouveau dossier:
```bash
mkdir halalscore-web
cd halalscore-web
```

2. Copie les fichiers téléchargés dans cette structure:
```
halalscore-web/
├── pages/
│   ├── index.jsx          (fichier téléchargé)
│   └── _app.jsx           (fichier téléchargé)
├── styles/
│   └── globals.css        (fichier téléchargé)
├── package.json           (fichier téléchargé)
├── next.config.js         (fichier téléchargé)
└── tailwind.config.js     (fichier téléchargé)
```

## ÉTAPE 2: INITIALISER GIT

```bash
git init
git add .
git commit -m "Initial commit"
```

## ÉTAPE 3: PUSH SUR GITHUB

1. Va sur GitHub.com
2. Crée un nouveau repository "halalscore-web"
3. Puis:

```bash
git remote add origin https://github.com/TON_USERNAME/halalscore-web.git
git branch -M main
git push -u origin main
```

## ÉTAPE 4: DÉPLOYER SUR VERCEL

**MÉTHODE FACILE (Recommandée):**

1. Va sur https://vercel.com
2. Clique "Add New" → "Project"
3. Importe ton repository "halalscore-web"
4. Clique "Deploy"
5. TERMINÉ ! 🎉

**URL:** https://halalscore-web.vercel.app

---

## AUTOMATIQUE !

Chaque fois que tu push sur GitHub, Vercel redéploie automatiquement ! ✨
