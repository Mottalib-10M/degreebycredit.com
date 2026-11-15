# Synthèse du test naïf du 2026-11-14, tour 5 : degreebycredit.com (corrections du 6e tour)

Notes : testeur 1 : 7/7/8 ; testeur 2 : 7/7/8 ; testeur 3 : 7/6/8 (clarté / facilité / utilité).
Version testée : d7af58c. Correction validée par l'éditeur : 1 (champ « Find your college »).

| # | Difficulté relevée | Testeurs | Décision | Cause et correction |
|---|---|---|---|---|
| 1 | Google promet « Prices at 2,530 Online Colleges », aucune case pour taper le nom de MON école | 1, 2, 3 | **corrigé** | Champ « Find your college » en haut de l'accueil (au-dessus du calculateur) et de la page accredited (`CollegeLookup.tsx`, `lib/college-search.ts`). Recherche parmi les 2,530 colleges en ligne déjà dans les données (colleges.json, ≥ 50 étudiants entièrement en ligne) : insensible à la casse et aux accents, mots partiels dans n'importe quel ordre, nom, ville, État, et sigle (SNHU, WGU). Les homonymes (3 « Columbia College ») sont tous proposés, distingués par ville et État. Fiche : prix par crédit résident et hors État (prix annuel : « $5,742 a year, whatever the credits: $191.40 a credit at 30 credits a year ($5,742 ÷ 30) »), frais annuels, coût du diplôme choisi avec les crédits déjà acquis (même fonction `degreeAtPace` que le calculateur et que `schoolCost` des tableaux), ville/État, public/privé, et lien vers la fiche College Scorecard. Données : `/data/college-search.json` construit au build, chargé au premier clic dans le champ (276 Ko, 91 Ko compressé). |
| 2 | Page accredited : pas de moyen de vérifier une école | 2, 3 (1 au tour 4) | **corrigé** | Même champ en tête de la page, avec l'accréditeur (champ Scorecard déjà présent) et le lien « Check its accreditation on College Scorecard ». Chapeau : « type its name in the field below ». |
| 3 | Lien Scorecard : format | — | **vérifié** | Format officiel lu dans collegescorecard.ed.gov/sitemap.xml (lu le 2026-11-15, copie brute dans `data/raw/`, extrait versionné `src/data/scorecard-slugs.json` par `scripts/build-scorecard-slugs.py`) : `/school/?UNITID-Nom_avec_soulignés`. 26 colleges renommés gardent l'adresse du sitemap ; les 100 absents du sitemap (sans fiche Scorecard) renvoient à leur fiche College Navigator (NCES, `?id=UNITID`), dit en clair. |
| 4 | « 2026 » dans le titre, prix 2023-24 | 1, 2 | **non retenu** | Non validé pour ce tour (la fiche du nouveau champ dit « Prices the college reported for 2023-24 »). |
| 5 | Jargon (IPEDS, median, notes grises) | 1, 2, 3 | **non retenu** | Non validé pour ce tour. |
| 6 | Accueil long, « Every page, by question » tout en bas | 2, 3 | **non retenu** | Non validé pour ce tour. |
| 7 | « 16 % » du budget mensuel sans liste d'écoles | 2, 3 | **non retenu** | Non validé pour ce tour. |
| 8 | Libellés ambigus frais compris / cours seuls dans les tableaux | 2, 3 | **non retenu** | Non validé pour ce tour. |
| 9 | Répétitions d'une page à l'autre (bandeau, pied « Radif Partners ») | 1, 2, 3 | **non retenu** | Éléments de trame ; non validé pour ce tour. |
| 10 | « You live: In the same state » | 1 | **non retenu** | Un seul testeur, non validé. |
| 11 | CSU Channel Islands « $227.23 (one yearly price of $5,742, over 30 credits) » | 1 | **non retenu** | Pas d'erreur de calcul : ($5,742 + $1,075 de frais) ÷ 30 = $227.23 ; libellé à revoir si l'éditeur le valide. Le nouveau champ donne la décomposition. |
| 12 | Économie de crédits transférés sans les frais | 1 | **non retenu** | Un seul testeur, non validé. |
| 13 | Deux seuils 50/500 étudiants sur la même page | 1 | **non retenu** | Un seul testeur, non validé. |
| 14 | Taux de réussite bas non signalés dans les « cheapest » | 2 | **non retenu** | Un seul testeur, non validé. |
| 15 | Liste par État triée par prix, mon État caché | 3 | **non retenu** | Un seul testeur, non validé. |
| 16 | Titre de la page About | 2 | **non retenu** | Un seul testeur, non validé. |
| 17 | Rubrique « Degrees » seule fermée dans le menu | 2 | **non retenu** | Effet du script de captures (déjà relevé). |

Résultat : `npm run check` passe (code 0) : 267 tests, check-premier-ecran 0/23, check-layout 0, check-saisie 0, check-regles 0, check-motcle 0/23. Chapeau de la page accredited raccourci pour garder le calculateur au premier écran.
