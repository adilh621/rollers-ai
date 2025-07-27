# 🏎️ rollersAI

**rollersAI** is a full-stack web application that allows users to upload an image of their car and receive an AI-generated rolling shot, stylized with custom parameters such as time of day, ambiance, setting, and lighting.

---

## 🚀 Features

- Google OAuth authentication via Supabase  
- Secure image upload to Supabase Storage  
- Customizable input parameters (e.g., time, ambiance, lighting)  
- AI-powered image generation using OpenAI's API  
- Render-hosted FastAPI backend  
- Vercel-hosted Next.js frontend  
- Live progress bar and responsive UI  

---

## 🧰 Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Supabase Auth + Storage, Axios  
- **Backend**: FastAPI, Uvicorn, OpenAI API, Pillow, Requests  
- **Hosting**: Vercel (frontend), Render (backend)  

---

## 📂 🧪 Example Flow
- User signs in via Google

- Uploads car image

- Selects visual parameters

- Backend processes image with OpenAI

- Returns stylized rolling shot

