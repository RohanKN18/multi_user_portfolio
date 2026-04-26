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
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";

// ================= MODELS =================
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
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to db");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

// ================= SESSION STORE =================
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

// ================= SESSION CONFIGURATION =================
const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= ROUTES =================
app.use("/", AdminRouter);
app.use("/", PublicportfolioRouter);

app.use("/:username/portfolio/projects", portfolioprojectRouter);
app.use("/:username/portfolio/core", coreskillsRouter);
app.use("/:username/portfolio/topics", topicsRouter);
app.use("/:username/portfolio/skills", skillsRouter);
app.use("/:username/portfolio", PortfolioRouter);

// ================= DEFAULT ROUTE =================
app.get("/:username", async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.render("home/home.ejs", { username: user.username });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.log("ERROR:", err);
    res.status(500).send("Something went wrong");
});

// ================= SERVER START =================
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
