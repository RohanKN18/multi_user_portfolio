import express from "express";
const router = express.Router();

import passport from "passport";

import User from "../models/user.js";
import Greeting from "../models/greeting.js";
import Skill from "../models/skill.js";
import Project from "../models/project.js";
import Education from "../models/education.js";
import Footer from "../models/footer.js";

import { isLoggedIn } from "../middleware.js";


router.get("/allusers", async (req, res) => {
    const users = await User.find();
    res.render("allusers", { users });
});

// ================= REGISTER =================
router.get("/register", (req, res) => {
    res.render("register/register.ejs");
});

router.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;

        const newUser = new User({ username, email });
        const user = await User.register(newUser, password);

        // ================= AUTO SEED USER DATA =================

        await Greeting.create({
            owner: user._id,
            hi: "Hi",
            name: username,
            title: "Developer",
            description: "Edit your introduction"
        });

        await Skill.create({
            owner: user._id,
            skillName: `${username}'s Skills`,
            slug: `${username}-skills-${user._id}`,
            topics: []
        });

        await Project.create({
            owner: user._id,
            projectName: `${username}'s First Project`,
            projectSlug: `${username}-first-project-${user._id}`,
            description: "Click edit to customize",
            techStack: {
                languages: [],
                frameworks: [],
                databases: [],
                tools: []
            },
            features: [],
            highlights: []
        });

        await Education.create({
            owner: user._id,
            level: "Add your education"
        });

        await Footer.create({
            owner: user._id,
            contact: {
                email: "",
                phone: ""
            },
            socialLinks: [],
            copyright: {
                year: new Date().getFullYear(),
                name: username
            }
        });

        res.redirect("/loginform");

    } catch (err) {
        console.log("REGISTER ERROR:", err);
        res.send("Error registering user");
    }
});


// ================= LOGIN =================
router.get("/loginform", (req, res) => {
    res.render("login/loginpage.ejs");
});

router.get("/loginfail", (req, res) => {
    res.render("login/loginfail.ejs");
});

router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/loginfail",
    }),
    (req, res) => {
        res.redirect(`/${req.user.username}/portfolio`);
    }
);


// ================= LOGOUT =================
router.get("/logout", (req, res, next) => {
    // ✅ store username BEFORE logout
    const username = req.user?.username;

    req.logout(function (err) {
        if (err) return next(err);

        // ✅ destroy session completely
        req.session.destroy((err) => {
            if (err) return next(err);

            // ✅ clear cookie (important)
            res.clearCookie("connect.sid");

            // ✅ redirect safely
            if (username) {
                return res.redirect(`/${username}/publicportfolio`);
            }

            return res.redirect("/"); // fallback
        });
    });
});



export default router;