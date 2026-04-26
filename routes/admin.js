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

router.get("/", (req, res) => {
    res.redirect("/home");
});

router.get("/home", async (req, res) => {
    const users = await User.find();
    res.render("allusers", { users, currentUser: req.user || null });
});

router.get("/allusers", async (req, res) => {
    const users = await User.find();
    res.render("allusers", { users, currentUser: req.user || null });
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

        // Education intentionally NOT seeded on register.
        // The empty state in education.ejs shows "Add Education" automatically.

        await Footer.create({
            owner: user._id,
            contact: { email: "", phone: "" },
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
    const username = req.user?.username;

    req.logout(function (err) {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie("connect.sid");

            if (username) {
                return res.redirect(`/${username}/publicportfolio`);
            }
            return res.redirect("/");
        });
    });
});


// ================= DELETE ACCOUNT =================
router.post("/delete-account", isLoggedIn, async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = req.user;

        const verified = await new Promise((resolve) => {
            User.authenticate()(user.username, password, (err, result) => {
                resolve(!err && !!result);
            });
        });

        if (!verified) {
            return res.redirect(
                `/allusers?deleteError=${encodeURIComponent("Incorrect password. Account was not deleted.")}&deleteTarget=${user.username}`
            );
        }

        const userId = user._id;

        await Promise.all([
            Greeting.deleteMany({ owner: userId }),
            Skill.deleteMany({ owner: userId }),
            Project.deleteMany({ owner: userId }),
            Education.deleteMany({ owner: userId }),
            Footer.deleteMany({ owner: userId }),
        ]);

        await User.findByIdAndDelete(userId);

        req.logout(function (err) {
            if (err) return next(err);
            req.session.destroy((err) => {
                if (err) return next(err);
                res.clearCookie("connect.sid");
                res.redirect("/allusers?deleted=1");
            });
        });

    } catch (err) {
        console.log("DELETE ACCOUNT ERROR:", err);
        res.status(500).send("Server error while deleting account");
    }
});



export default router;
