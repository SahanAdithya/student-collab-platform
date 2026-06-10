<div align="center">
  <br />
  <br />

  <h1>🎓 Student Collab Platform</h1>
  
  <p>
    <b>A powerful and intuitive collaboration hub designed for students to manage projects, share resources, work together seamlessly, and experience single-credential Single Sign-On (SSO).</b>
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
    <img src="https://img.shields.io/badge/WSO2_Asgardeo-FF5000?style=for-the-badge&logo=wso2&logoColor=white" alt="WSO2 Asgardeo" />
  </p>
</div>

<hr />

## 📖 About The Project

The **Student Collab Platform** is built to bridge the gap in student teamwork. Whether you are assigning tasks, dropping PDFs for assignments, or streamlining your workflow, this platform provides a unified workspace. 

Additionally, this repository hosts the **Smart Campus Login System**, showcasing **Single Sign-On (SSO)** integration using **WSO2 Asgardeo** to unify separate campus portals (such as the Student Portal and Library Portal) under a single identity provider.

### ✨ Key Features

* 🔒 **Secure Authentication:** Powered by Clerk for seamless sign-ups, log-ins, and user profile management in the main Next.js app.
* 🗄️ **Real-time Database:** Built on Supabase for robust and fast data syncing across the collaboration workspace.
* 📄 **PDF Dropzone:** Easily drag-and-drop PDFs and documents into your collaborative projects.
* 📧 **Automated Emails:** Integrated with Nodemailer to keep your team notified of important updates.
* 🎨 **Modern UI:** Fully responsive and beautifully crafted with Tailwind CSS and Lucide React Icons.
* 🔑 **Smart Campus SSO (WSO2 Asgardeo Integration):** Single Sign-On (SSO) across two micro-frontend portals (Student Portal and Library Portal) so students can log in once and access both apps seamlessly.

<hr />

## 🛠️ Built With

This project leverages modern web development tools to ensure performance, scalability, and an excellent user experience.

<table>
  <tr>
    <td align="center" width="110">
      <a href="https://nextjs.org/">
        <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
        <br>Next.js
      </a>
    </td>
    <td align="center" width="110">
      <a href="https://www.typescriptlang.org/">
        <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
        <br>TypeScript
      </a>
    </td>
    <td align="center" width="110">
      <a href="https://tailwindcss.com/">
        <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind CSS" />
        <br>Tailwind
      </a>
    </td>
    <td align="center" width="110">
      <a href="https://supabase.com/">
        <img src="https://skillicons.dev/icons?i=supabase" width="48" height="48" alt="Supabase" />
        <br>Supabase
      </a>
    </td>
    <td align="center" width="110">
      <a href="https://clerk.com/">
        <img src="https://avatars.githubusercontent.com/u/49538330?s=200&v=4" width="48" height="48" alt="Clerk" style="border-radius:10px;"/>
        <br>Clerk
      </a>
    </td>
    <td align="center" width="110">
      <a href="https://wso2.com/asgardeo/">
        <img src="https://avatars.githubusercontent.com/u/47547?s=200&v=4" width="48" height="48" alt="WSO2 Asgardeo" style="border-radius:10px;"/>
        <br>WSO2 Asgardeo
      </a>
    </td>
  </tr>
</table>

<hr />

## 📁 Repository Structure

```
├── app/                       # Next.js Application Pages (Main App)
├── components/                # Reusable UI components
├── tsconfig.json              # Next.js TypeScript Config (Excludes wso2-assignment)
├── wso2-assignment/           # WSO2 Internship Assignment Sub-projects
│   ├── student-portal/        # React + Vite application (Port 5173)
│   │   ├── .env               # Student Portal Asgardeo Credentials
│   │   └── src/               # Authentication and Portal logic
│   └── library-portal/        # React + Vite application (Port 5174)
│       ├── .env               # Library Portal Asgardeo Credentials
│       └── src/               # SSO check & Library details
```

<hr />

## 🛡️ WSO2 Asgardeo Integration (Smart Campus SSO)

To solve the problem of university students juggling different passwords for different campus apps, this assignment demonstrates **Single Sign-On (SSO)** between two independent React web applications:
1. **Student Portal** (`http://localhost:5173`)
2. **Library Portal** (`http://localhost:5174`)

### ⚡ SSO in Action
* A student logs in once at the **Student Portal** using Asgardeo (including Google / GitHub social login options).
* When they navigate to the **Library Portal**, they click **Login with Asgardeo** and are instantly logged in without being prompted for credentials, thanks to session sharing managed by WSO2 Asgardeo.
* Logging out of one portal terminates the shared session, upholding secure modern access control.

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

* Node.js (v18 or higher recommended)
* npm
  ```sh
  npm install npm@latest -g
  ```

### 1. Running the Main Next.js App

1. **Clone the repository:**
   ```sh
   git clone https://github.com/SahanAdithya/student-collab-platform.git
   cd student-collab-platform
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and configure Supabase, Clerk, and Nodemailer SMTP parameters.
4. **Start the local server:**
   ```sh
   npm run dev
   ```
   Open `http://localhost:3000` to interact with the Next.js platform.

---

### 2. Running the WSO2 Asgardeo SSO Portals

#### Step A: Asgardeo Console Setup
1. Log into the [Asgardeo Console](https://console.asgardeo.io/).
2. Create two **Single Page Applications (SPA)**:
   * **App 1: Student Portal**
     * Authorized Redirect URLs: `http://localhost:5173`
     * Allowed Origins: `http://localhost:5173`
   * **App 2: Library Portal**
     * Authorized Redirect URLs: `http://localhost:5174`
     * Allowed Origins: `http://localhost:5174`
3. *(Optional)* Go to **Connections** in Asgardeo to configure Social Logins (Google/GitHub) and add them to the sign-in methods for both apps.

#### Step B: Set Environment Variables
Add your credentials in the respective `.env` files in the `wso2-assignment` directories:

* **Student Portal Environment (`wso2-assignment/student-portal/.env`):**
  ```env
  VITE_ASGARDEO_CLIENT_ID=<YOUR_STUDENT_PORTAL_CLIENT_ID>
  VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/<YOUR_ORG_NAME>
  VITE_ASGARDEO_SIGN_OUT_REDIRECT_URL=http://localhost:5173
  VITE_ASGARDEO_SIGN_IN_REDIRECT_URL=http://localhost:5173
  ```

* **Library Portal Environment (`wso2-assignment/library-portal/.env`):**
  ```env
  VITE_ASGARDEO_CLIENT_ID=<YOUR_LIBRARY_PORTAL_CLIENT_ID>
  VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/<YOUR_ORG_NAME>
  VITE_ASGARDEO_SIGN_OUT_REDIRECT_URL=http://localhost:5174
  VITE_ASGARDEO_SIGN_IN_REDIRECT_URL=http://localhost:5174
  ```

#### Step C: Start both applications
Open two separate terminal sessions to launch the micro-frontend dev servers:

* **Terminal 1 (Student Portal):**
  ```sh
  cd wso2-assignment/student-portal
  npm run dev
  ```
  *(Runs on http://localhost:5173)*

* **Terminal 2 (Library Portal):**
  ```sh
  cd wso2-assignment/library-portal
  npm run dev
  ```
  *(Runs on http://localhost:5174)*
