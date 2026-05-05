# Transfer Certificate (TC) Web Application

## Architecture
- **Frontend**: React + TypeScript (Create React App)
- **Database**: Supabase (PostgreSQL)
- **Logo Storage**: Cloudinary (unsigned upload)
- No separate backend — all data access is done directly from the frontend via Supabase JS client

---

## 1. Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `src/db/schema.sql`
3. Copy your **Project URL** and **anon public key** from Project Settings → API

---

## 2. Cloudinary Setup

1. Create a free account at https://cloudinary.com
2. Go to **Settings → Upload → Upload Presets**
3. Create an **unsigned** upload preset (e.g. `tc_logos`)
4. Note your **Cloud Name** and the preset name

---

## 3. Environment Variables

Edit `client/.env`:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

---

## 4. Run the App

```bash
cd client
npm install
npm start
```

App runs at: http://localhost:3000

---

## Usage

1. Go to http://localhost:3000
2. Select or register a college (logo uploaded to Cloudinary)
3. Fill in the TC form and click **Generate Transfer Certificate**
4. Preview the certificate in exact printed format
5. Click **Download PDF** to save as A4 PDF
6. Go to **Records** to view, download, or delete any TC

---

## Project Structure

```
client/
  src/
    api/
      supabase.ts        ← Supabase client
      cloudinary.ts      ← Cloudinary unsigned upload helper
    lib/
      tc.ts              ← TC CRUD (Supabase)
      college.ts         ← College CRUD + logo upload
    components/
      TCCertificate.tsx  ← Printable certificate component
      CollegeSelector.tsx
    context/
      CollegeContext.tsx
    pages/
      TCForm.tsx
      TCPreview.tsx
      Records.tsx
    types/
      tc.ts
    db/
      schema.sql         ← Run this in Supabase SQL Editor
```
