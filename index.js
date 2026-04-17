// ================= IMPORTS =================
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import mongoose from "mongoose";

// ================= MODELS =================
import Greeting from "./models/greeting.js";
import Education from "./models/education.js";
import Skill from "./models/skill.js";
import Project from "./models/project.js";
import Footer from "./models/footer.js";
import User from "./models/user.js";

// ================= ROUTES =================
import AdminRouter from "./routes/admin.js";
import PublicportfolioRouter from "./routes/publicportfolio.js";
import PortfolioRouter from "./routes/portfolio.js";

import skillsRouter from "./routes/portfolioskill/skills.js";
import coreskillsRouter from "./routes/portfolioskill/coreskills.js";
import topicsRouter from "./routes/portfolioskill/topics.js";

import portfolioprojectRouter from "./routes/portfolioproject.js";

// ================= APP INIT =================
const app = express();
const port = process.env.PORT || 8080;

// ================= PATH SETUP =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= DB CONNECTION =================
const MONGO_URL = "mongodb://127.0.0.1:27017/AandAmultipleUser";

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.log("❌ DB Connection Error:", err);
    }
}
connectDB();

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");

// ================= GLOBAL CONFIG =================
// const password = "meow";

// ================= IMPORTS =================
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";


// ================= SESSION CONFIGURATION =================
app.use(session({
    secret: "mysupersecretkey", // use .env in production
    resave: false,
    saveUninitialized: false
}));


// ================= PASSPORT INITIALIZATION =================
app.use(passport.initialize());
app.use(passport.session());


// ================= AUTHENTICATION STRATEGY =================
passport.use(new LocalStrategy(User.authenticate()));


// ================= SESSION HANDLING =================
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());













// ================= GLOBAL DATA MIDDLEWARE =================
// 🔥 Fetch from DB for EVERY request
app.use(async (req, res, next) => {
    try {
        const [skills, education, projects, greeting, footerData] = await Promise.all([
            Skill.find({}),
            Education.find({}),
            Project.find({}),
            Greeting.findOne({}),
            Footer.findOne({})
        ]);

        res.locals.skills = skills;
        res.locals.education = education;
        res.locals.projects = projects;
        res.locals.greeting = greeting;
        res.locals.footerData = footerData;
        

        next();
    } catch (err) {
        console.log("❌ Middleware Error:", err);
        next(err);
    }
});

// ================= ROUTES =================

// Root-level routes
app.use("/", AdminRouter);
app.use("/", PublicportfolioRouter);

// Portfolio routes (order matters)
app.use("/:username/portfolio/projects", portfolioprojectRouter);
app.use("/:username/portfolio/core", coreskillsRouter);
app.use("/:username/portfolio/topics", topicsRouter);
app.use("/:username/portfolio/skills", skillsRouter);
app.use("/:username/portfolio", PortfolioRouter);

// ================= DEFAULT ROUTES =================
app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    res.render("home/home.ejs");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.log("🔥 ERROR:", err);
    res.status(500).send("Something went wrong");
});

// ================= SERVER START =================
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});