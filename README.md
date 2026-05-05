# 🎓 College Discovery

**Find and compare colleges — all in one place.**

College Discovery is a full-stack web application that helps students explore colleges, compare key stats like acceptance rate and tuition, and save their favourites for later.

---

## 🌐 Live Demo

[dis-college.vercel.app](https://dis-college.vercel.app)

---

## ✨ Features

- 🔐 **Authentication** — Sign up and log in securely via Supabase Auth
- 🔍 **Search & Filter** — Search colleges by name or filter by state
- 📊 **College Cards** — View acceptance rate, tuition, enrollment, and website at a glance
- 📋 **Compare** — Side-by-side comparison of multiple colleges
- 🔖 **Save Colleges** — Bookmark colleges to your personal saved list
- 📱 **Responsive Design** — Works on desktop and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| Language | TypeScript |

---

## 🚀 Getting Started Locally

### 1. Clone the repo
```bash
git clone https://github.com/Harshvardhan-M/DIS-COLLEGE.git
cd DIS-COLLEGE
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Database Setup

Run this in your Supabase SQL Editor to create and populate the colleges table:

```sql
CREATE TABLE colleges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text,
  state text,
  acceptance_rate numeric,
  tuition numeric,
  enrollment integer,
  website text
);

-- Enable public read access
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON colleges FOR SELECT USING (true);
```

---

## 📁 Project Structure

```
app/
├── auth/
│   ├── login/        # Login page
│   └── sign-up/      # Sign up page
├── dashboard/        # Main college listing page
├── college/          # Individual college detail page
├── compare/          # College comparison page
└── saved/            # Saved colleges page
```

---

## 👨‍💻 Author

**Harshvardhan Magar**
- GitHub: [@Harshvardhan-M](https://github.com/Harshvardhan-M)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
