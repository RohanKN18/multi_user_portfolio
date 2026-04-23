# Multi-User Portfolio Platform

A full-stack web application that lets multiple users create, manage, and share their own personal portfolio websites — all on a single platform. Each user gets a unique public portfolio URL and a private admin dashboard to manage their content.

**Live Demo:** [multi-user-portfolio.onrender.com](https://multi-user-portfolio.onrender.com)

---

## Features

- **Multi-user support** — Each registered user gets their own isolated portfolio
- **Public portfolio page** — Shareable at `/<username>/publicportfolio`
- **Admin dashboard** — Private management panel at `/<username>/portfolio`
- **Sections managed per user:**
  - Introduction / greeting
  - Skills (with topics and core skills nested inside)
  - Projects (with tech stack, features, highlights, links)
  - Education
  - Footer (contact info, social links, copyright)
- **Authentication** — Register, login, and logout via Passport.js (local strategy)
- **Session persistence** — Sessions stored in MongoDB via connect-mongo
- **Auto-seeded data** — Default portfolio content created automatically on registration
- **Animated background** — Matrix-style binary rain effect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Templating | EJS |
| Authentication | Passport.js + passport-local-mongoose |
| Session Store | connect-mongo |
| Deployment | Render.com |

---

## Project Structure

```
AandAmultipleUser/
├── index.js                  # App entry point, middleware, route mounting
├── middleware.js             # Auth, user loading, portfolio loading helpers
├── models/
│   ├── user.js
│   ├── greeting.js
│   ├── skill.js
│   ├── project.js
│   ├── education.js
│   └── footer.js
├── routes/
│   ├── admin.js              # Register, login, logout
│   ├── portfolio.js          # Admin portfolio CRUD (intro, education, footer)
│   ├── portfolioproject.js   # Project CRUD
│   ├── publicportfolio.js    # Public-facing portfolio routes
│   └── portfolioskill/
│       ├── skills.js         # Skill CRUD
│       ├── topics.js         # Topic CRUD (nested in skill)
│       └── coreskills.js     # Core skill CRUD (nested in topic)
├── views/
│   ├── admin/                # Admin dashboard templates
│   ├── public/               # Public portfolio templates
│   ├── includes/             # Shared partials (head, navbar, footer, background)
│   ├── home/                 # Landing/user list page
│   ├── login/
│   └── register/
├── public/
│   ├── css/                  # Stylesheets
│   └── js/                   # Client-side scripts
└── utils/
    ├── slugify.js
    └── dataHelpers.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB Atlas account and cluster

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
ATLASDB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
SECRET=your_random_session_secret_here
```

> **Important:** Never commit your `.env` file. Make sure `.env` is listed in `.gitignore`.

4. Start the server:
```bash
npm start
```

5. Visit `http://localhost:8080`

---

## Environment Variables

| Variable | Description |
|---|---|
| `ATLASDB_URL` | MongoDB Atlas connection string |
| `SECRET` | Session encryption secret (use a long random string) |

---

## URL Structure

| URL | Description | Auth required |
|---|---|---|
| `/` | Redirects to `/home` | No |
| `/home` or `/allusers` | Lists all registered users | No |
| `/register` | Registration page | No |
| `/loginform` | Login page | No |
| `/logout` | Logs out current user | Yes |
| `/:username` | User home page | No |
| `/:username/publicportfolio` | Public portfolio view | No |
| `/:username/portfolio` | Admin dashboard | Yes (owner) |
| `/:username/portfolio/editintro` | Edit introduction | Yes (owner) |
| `/:username/portfolio/editeducation` | Edit education | Yes (owner) |
| `/:username/portfolio/editfooter` | Edit footer | Yes (owner) |
| `/:username/portfolio/addskill` | Add a skill | Yes (owner) |
| `/:username/portfolio/skills/:slug` | Skill detail page | Yes (owner) |
| `/:username/portfolio/projects/:id` | Project detail page | Yes (owner) |
| `/:username/portfolio/projects/addproject` | Add a project | Yes (owner) |

---

## Data Models

**User** — username, email, hashed password (via passport-local-mongoose)

**Greeting** — hi, name, title, description — linked to owner

**Skill** — skillName, slug, topics[] → each topic has topicName and coreSkills[]

**Project** — projectName, projectSlug, description, image, video, techStack (languages, frameworks, databases, tools), features[], highlights[], githubLink, liveLink, role, status, startDate, endDate — linked to owner

**Education** — level, school, score — linked to owner

**Footer** — contact (email, phone), socialLinks[] (name, url), copyright (year, name) — linked to owner

---

## Deployment

This project is deployed on [Render.com](https://render.com) as a web service.

To deploy your own instance:

1. Push your code to GitHub (without `.env`)
2. Create a new Web Service on Render
3. Set the build command to `npm install` and start command to `npm start`
4. Add environment variables `ATLASDB_URL` and `SECRET` in the Render dashboard
5. Deploy

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## License

MIT
