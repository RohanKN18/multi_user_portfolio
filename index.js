import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// ================= IMPORTS =================
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";


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
const dbUrl=process.env.ATLASDB_URL;



main().then(()=>{
    console.log("connceted to db");
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl)
}


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

store.on("error",(err)=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================

app.set("view engine", "ejs");

app.set("trust proxy", 1);

// ================= GLOBAL CONFIG =================
// const password = "meow";

// ================= IMPORTS =================
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";


// ================= SESSION CONFIGURATION =================
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions));


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
app.get("/:username", async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
        return res.status(404).send("User not found");
    }

    res.render("home/home.ejs", { username: user.username });
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