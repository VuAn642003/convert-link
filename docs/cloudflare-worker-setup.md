# Cloudflare Worker Setup (Form static + GitHub API)

Tai lieu nay huong dan chi tiet tu A-Z de ban co he thong:

- Form static: `https://vuan642003.github.io/convert-link/admin/`
- Worker API giu secret
- Tu dong commit `links.json` vao GitHub
- GitHub Actions tu deploy lai GitHub Pages

---

## 0) Dieu kien can co

- Tai khoan GitHub co quyen repo `VuAn642003/convert-link`
- Tai khoan Cloudflare (free)
- Da cai Node.js + npm

Kiem tra nhanh:

```bash
node -v
npm -v
```

---

## 1) Tao GitHub token dung cho Worker

Khuyen nghi dung **Fine-grained personal access token**.

### Buoc tao token

1. Vao GitHub `Settings`
2. Chon `Developer settings`
3. Chon `Personal access tokens`
4. Chon `Fine-grained tokens`
5. Bam `Generate new token`

### Cau hinh token

- **Token name**: `convert-link-worker`
- **Expiration**: 90 days (hoac tuy nhu cau)
- **Repository access**: `Only select repositories`
  - Chon: `VuAn642003/convert-link`
- **Permissions**:
  - `Contents`: `Read and write`

Sau khi tao:

- Copy token ngay (GitHub chi hien 1 lan)
- Luu an toan trong password manager

> Neu mat token, phai tao token moi.

---

## 2) Tao ADMIN_KEY

`ADMIN_KEY` la key bao ve endpoint Worker. Form phai gui dung key nay moi duoc them link.

Co the tao key ngau nhien bang OpenSSL:

```bash
openssl rand -base64 32
```

Hoac Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Luu key nay an toan, khong commit len repo.

---

## 3) Deploy Worker len Cloudflare

Trong root repo:

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

Neu deploy thanh cong, ban se nhan duoc URL dang:

```text
https://convert-link-admin-api.<subdomain>.workers.dev
```

---

## 4) Set secrets cho Worker

Van trong thu muc `worker/`:

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put ADMIN_KEY
```

- Lenh se yeu cau ban paste gia tri secret
- Khong in ra man hinh sau khi luu

---

## 5) Chinh bien public trong `wrangler.toml`

File: `worker/wrangler.toml`

Can dam bao cac bien dung voi repo cua ban:

- `GITHUB_OWNER = "VuAn642003"`
- `GITHUB_REPO = "convert-link"`
- `GITHUB_BRANCH = "main"`
- `SITE_URL = "https://vuan642003.github.io/convert-link"`
- `ALLOWED_ORIGIN = "https://vuan642003.github.io"`

Neu sua file nay, deploy lai:

```bash
npx wrangler deploy
```

---

## 6) Test Worker truoc khi dung form

### Health check

```bash
curl "https://<worker-subdomain>.workers.dev/health"
```

Mong doi:

```json
{"ok":true}
```

### Test create-link bang curl

```bash
curl -X POST "https://<worker-subdomain>.workers.dev/create-link" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: <ADMIN_KEY>" \
  -d '{
    "slug": "test-slug-01",
    "image": "https://example.com/image.jpg",
    "targetUrl": "https://s.shopee.vn/xxxxxxxx",
    "title": "",
    "description": ""
  }'
```

Mong doi:

- Tra ve JSON co `ok: true`
- Co `url` moi
- Co `commitUrl`

---

## 7) Dung form admin static

Mo:

```text
https://vuan642003.github.io/convert-link/admin/
```

Nhap:

- **Worker API URL**: `https://<worker-subdomain>.workers.dev/create-link`
- **Admin Key**: gia tri `ADMIN_KEY`
- **Slug**
- **URL anh**
- **Target URL**
- **Title/Description** (co the de trong)

Submit xong:

1. Worker commit `links.json`
2. GitHub Actions trong repo tu chay
3. Site Pages duoc deploy lai
4. Ban dung URL moi: `https://vuan642003.github.io/convert-link/<slug>/`

---

## 8) Kiem tra deploy sau moi lan tao link

Sau khi form bao thanh cong:

1. Vao repo GitHub `Actions`
2. Mo workflow `Deploy GitHub Pages`
3. Cho trang thai xanh
4. Test URL moi tren browser

Neu share Facebook:

- Dung Sharing Debugger
- `Scrape Again` de xoa cache preview cu

---

## 9) Xu ly loi thuong gap

### 401 Unauthorized

- Sai `ADMIN_KEY`
- Chua set `ADMIN_KEY` trong Worker

### 403 Origin not allowed

- `ALLOWED_ORIGIN` khong dung
- Can la `https://vuan642003.github.io`

### GitHub read/write failed

- `GITHUB_TOKEN` sai/het han
- Token khong co quyen `Contents: Read and write`
- Token khong duoc cap cho repo `convert-link`

### Slug already exists

- `slug` da co trong `links.json`
- Doi slug khac

---

## 10) Bao mat van hanh

- Khong bao gio hardcode `GITHUB_TOKEN` vao frontend
- Khong commit `ADMIN_KEY`
- Dinh ky rotate `GITHUB_TOKEN` va `ADMIN_KEY` (1-3 thang)
- Neu nghi lo key: rotate ngay lap tuc

---

## 11) Checklist nhanh

- [ ] Worker deploy thanh cong
- [ ] `GITHUB_TOKEN` da set secret
- [ ] `ADMIN_KEY` da set secret
- [ ] `/health` tra ve `ok: true`
- [ ] Form submit tao duoc commit moi
- [ ] GitHub Actions deploy xanh
- [ ] URL moi mo duoc tren Pages
