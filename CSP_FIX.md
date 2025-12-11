# Content Security Policy Fix

## 🔧 Masalah yang Diperbaiki

### Error yang Terjadi:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Loading the script 'blob:http://localhost:3001/...' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'"
```

## ✅ Perbaikan yang Dilakukan

### 1. Updated CSP di `index.html`
**Sebelum:**
```html
script-src 'self' 'unsafe-inline';
```

**Sesudah:**
```html
script-src 'self' 'unsafe-inline' blob: data:;
```

**Alasan:**
- Vite dev server menggunakan `blob:` URLs untuk Hot Module Replacement (HMR)
- `data:` URLs juga digunakan untuk beberapa inline scripts
- Tanpa ini, browser akan memblokir script dari blob URLs

### 2. Added WebSocket Support
**Ditambahkan:**
```html
connect-src 'self' ws: wss:;
```

**Alasan:**
- Vite HMR menggunakan WebSocket untuk live reload
- `ws:` dan `wss:` diperlukan untuk koneksi WebSocket

### 3. Updated Image Sources
**Ditambahkan:**
```html
img-src 'self' data: blob:;
```

**Alasan:**
- Beberapa gambar mungkin menggunakan blob URLs
- `data:` URLs untuk inline images

## 📋 CSP Directive Lengkap

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' blob: data:; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: blob:;
               connect-src 'self' ws: wss:;">
```

## 🔒 Security Notes

### Development vs Production

**Development (Current):**
- Mengizinkan `blob:`, `data:`, `ws:`, `wss:` untuk Vite HMR
- Lebih permisif untuk kemudahan development

**Production (Recommended):**
- Hapus `blob:` dan `data:` dari script-src jika tidak diperlukan
- Gunakan nonce-based CSP untuk lebih aman
- Atau gunakan hash-based CSP

### Contoh CSP untuk Production:
```html
<!-- Production CSP (lebih ketat) -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data:;">
```

## 🚀 Testing

Setelah perbaikan:
1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Check console untuk error CSP
4. Verify HMR bekerja (ubah file, harus auto-reload)

## 📝 Troubleshooting

### Masih ada error CSP?
1. Check browser console untuk directive yang spesifik
2. Pastikan semua resource yang diperlukan di-allow
3. Gunakan browser DevTools > Security untuk melihat CSP violations

### 404 Errors?
1. Pastikan semua file ada di lokasi yang benar
2. Check `vite.config.js` untuk path configuration
3. Verify `src/app.js` exists dan dapat diakses

### HMR tidak bekerja?
1. Check WebSocket connection di Network tab
2. Verify `connect-src` includes `ws:` dan `wss:`
3. Check Vite server logs untuk errors

---

*CSP diperbaiki untuk mendukung Vite development server sambil tetap menjaga keamanan.*

