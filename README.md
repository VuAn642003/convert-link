# Convert Link

Web tinh sinh ra nhieu URL redirect trung gian, moi URL co Open Graph rieng de share len Facebook va sau do chuyen huong sang Shopee.

## Cach hoat dong

- Moi object trong `links.json` se tao ra mot trang HTML rieng tai `/<slug>/`
- Moi trang co bo the Open Graph rieng: `og:title`, `og:description`, `og:image`, `og:url`
- Khi nguoi dung mo URL do, trang se redirect sang `targetUrl`

## Cau truc du lieu

Sua file `links.json`:

```json
{
  "siteUrl": "https://vuan642003.github.io/convert-link",
  "links": [
    {
      "slug": "sp-ao-1",
      "title": "Ao phong sale",
      "description": "Mau ao phong gia tot",
      "image": "https://example.com/ao-phong.jpg",
      "targetUrl": "https://shopee.vn/..."
    }
  ]
}
```

## Them mot URL moi

1. Mo `links.json`
2. Them 1 object moi vao mang `links`
3. Dat `slug` khong trung
4. Push len nhanh `main`

Sau khi GitHub Actions chay xong, URL moi cua ban se la:

```text
https://vuan642003.github.io/convert-link/<slug>/
```

## Chay local

```bash
npm install
npm test
npm run build
```

File build nam trong thu muc `dist/`.

## Form tao link online (Cloudflare Worker + GitHub API)

Form static nam tai: `https://vuan642003.github.io/convert-link/admin/`

Form nay se goi Cloudflare Worker API. Worker giu secret va commit truc tiep vao `links.json`, sau do GitHub Actions tu deploy Pages.

Huong dan day du tung buoc: `docs/cloudflare-worker-setup.md`

### 1) Deploy Worker (free)

Trong thu muc `worker/`:

```bash
npx wrangler login
npx wrangler deploy
```

File cau hinh: `worker/wrangler.toml`

### 2) Tao secrets cho Worker

```bash
cd worker
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put ADMIN_KEY
```

- `GITHUB_TOKEN`: Fine-grained PAT, cap quyen repo `VuAn642003/convert-link` voi `Contents: Read and write`
- `ADMIN_KEY`: mat khau ban tu dat de bao ve form

### 3) Kiem tra API

```bash
curl "https://<worker-subdomain>.workers.dev/health"
```

Ket qua mong doi:

```json
{"ok":true}
```

### 4) Dung form admin

Mo: `https://vuan642003.github.io/convert-link/admin/`

Nhap:

- Worker API URL: `https://<worker-subdomain>.workers.dev/create-link`
- Admin Key
- `slug`, `image`, `targetUrl` (+ `title/description` tuy chon)

Submit xong:

- Worker commit vao `links.json`
- GitHub Actions tu chay deploy
- Form tra ve URL moi + link commit

## Form tao link local (fallback)

Neu ban muon chay local:

```bash
npm run admin
```

Mo `http://localhost:8787`.

## Deploy GitHub Pages

1. Push code len repo `VuAn642003/convert-link`
2. Vao `Settings > Pages`
3. Chon `Source: GitHub Actions`
4. Moi lan push len `main`, site se tu build va deploy

## Luu y khi share Facebook

- Facebook co cache preview, nen khi sua OGP cua cung 1 URL co the chua doi ngay
- Neu can cap nhat nhanh, dung Facebook Sharing Debugger de scrape lai
- Neu muon preview moi chac chan, tao `slug` moi
