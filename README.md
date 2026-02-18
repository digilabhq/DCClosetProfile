# DCClosetProfile

Client closet profile questionnaire PWA (GitHub Pages).

## Deploy (GitHub Pages)
1. Copy all files in this folder to the new repo root.
2. GitHub → Settings → Pages:
   - Source: Deploy from a branch
   - Branch: main, folder: /(root)
3. URL:
   https://digilabhq.github.io/DCClosetProfile/

## Notes
- Config-driven rendering lives in `config/questions.js`.
- Styles in `styles/main.css`.
- PDF generator in `utils/pdf-generator.js`.
- PDF filename: `<Client Name> - YYYY-MM-DD.pdf`
- Replace placeholder images in:
  - `assets/images/materials/`
  - `assets/images/hardware/`
