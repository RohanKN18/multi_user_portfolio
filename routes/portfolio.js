import express from "express";
// const router = express.Router();
const router = express.Router({ mergeParams: true });

import { generateSlug } from "../utils/slugify.js";

import Skill from "../models/skill.js";
import Greeting from "../models/greeting.js";
import Education from "../models/education.js";
import Footer from "../models/footer.js";

import { isLoggedIn } from "../middleware.js";


import { getUserByUsername } from "../middleware.js";
import { loadUserPortfolio } from "../middleware.js";
import { loadSelectedSkill } from "../middleware.js";
import { loadSelectedProject } from "../middleware.js";
import { attachUsername } from "../middleware.js";



// ================= PORTFOLIO =================
router.get(
    "/",
    isLoggedIn,
    getUserByUsername,
    loadUserPortfolio,
    (req, res) => {

        // res.send("middleware is working");

        res.render("admin/portfolio.ejs", {
            user: req.user,
            ...req.portfolio
        });
    }
);


// ================= ADD SKILL =================
router.get("/addskill", isLoggedIn, async (req, res) => {
    res.render("admin/skill/addskill.ejs", {
        user: req.user // optional (only if EJS needs it)
    });
});

router.post("/addskill", isLoggedIn, attachUsername, async (req, res) => {
    try {
        const { skill } = req.body;

        if (!skill || !skill.trim()) {
            return res.send("Skill name is required");
        }

        let baseSlug = generateSlug(skill);
        let slug = baseSlug;
        let count = 1;

        // ✅ ensure unique per user
        while (await Skill.findOne({ slug, owner: req.user._id })) {
            slug = `${baseSlug}-${count++}`;
        }

        await Skill.create({
            skillName: skill.trim(),
            slug,
            owner: req.user._id,
            topics: []
        });

        // ✅ FIXED redirect
        return res.redirect(`/${req.username}/portfolio#skillsSection`);

    } catch (err) {
        console.log(err);
        res.send("Error adding skill");
    }
});


// ================= EDIT INTRO =================
router.get("/editintro", isLoggedIn, attachUsername, async (req, res) => {
    const [greeting, footer] = await Promise.all([
        Greeting.findOne({ owner: req.user._id }),
        Footer.findOne({ owner: req.user._id })   // ← add this
    ]);

    res.render("admin/intro/editintro.ejs", {
        greeting,
        footer,   // ← add this
        user: req.user
    });
});

router.post("/editintro", isLoggedIn, attachUsername, async (req, res) => {
    try {
        const { hi, name, title, description } = req.body;

        await Greeting.findOneAndUpdate(
            { owner: req.user._id },
            { hi, name, title, description },
            { new: true, upsert: true }
        );

        // ✅ FIXED redirect
        return res.redirect(`/${req.username}/portfolio`);

    } catch (err) {
        console.log(err);
        res.send("Error updating intro");
    }
});


// ================= EDIT EDUCATION =================
router.get("/editeducation", isLoggedIn, async (req, res) => {
    const [education, footer] = await Promise.all([
        Education.find({ owner: req.user._id }).sort({ createdAt: -1 }),
        Footer.findOne({ owner: req.user._id })   // ← add this
    ]);

    res.render("admin/education/editeducation.ejs", {
        education,
        footer,   // ← add this
        user: req.user
    });
});


// ================= ADD EMPTY EDUCATION ROW =================
router.get("/editeducation/addeducation", isLoggedIn, async (req, res) => {

    await Education.create({
        owner: req.user._id,
        level: "",
        school: "",
        score: ""
    });

    // ✅ FIXED redirect
    return res.redirect(`/${req.user.username}/portfolio/editeducation`);
});


// ================= UPDATE EDUCATION =================
router.post("/editeducation", isLoggedIn, async (req, res) => {
    try {
        const updatedEducation = Object.values(req.body.education || {});

        for (let item of updatedEducation) {

            if (item._id) {
                await Education.findOneAndUpdate(
                    { _id: item._id, owner: req.user._id },
                    {
                        level: item.level,
                        school: item.school,
                        score: item.score
                    },
                    { returnDocument: "after" } // ✅ mongoose fix
                );
            } else {
                if (item.level || item.school || item.score) {
                    await Education.create({
                        owner: req.user._id,
                        level: item.level,
                        school: item.school,
                        score: item.score
                    });
                }
            }
        }

        // ✅ FIXED redirect
        return res.redirect(`/${req.user.username}/portfolio`);

    } catch (err) {
        console.log(err);
        res.send("Error updating education");
    }
});



router.get("/editeducation/deleteeducation/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ delete only if owned by user (SECURITY)
        await Education.findOneAndDelete({
            _id: id,
            owner: req.user._id
        });

        return res.redirect(`/${req.user.username}/portfolio/editeducation`);

    } catch (err) {
        console.log(err);
        res.send("Error deleting education");
    }
});



router.get("/editfooter", isLoggedIn, loadUserPortfolio, async (req, res) => {
    try {
        res.render("admin/footer/editfooter.ejs", {
            user: req.user,
            ...req.portfolio   // this already has footer inside it
        });
    } catch (err) {
        console.log("FOOTER GET ERROR:", err);
        res.status(500).send("Server error");
    }
});


router.post("/editfooter", isLoggedIn, async (req, res) => {
    try {
        let footer = await Footer.findOne({ owner: req.user._id });
        if (!footer) footer = new Footer({ owner: req.user._id });

        footer.contact = {
            email: req.body.email?.trim() || "",
            phone: req.body.phone?.trim() || ""
        };

        // form sends socialLinks[0][name], socialLinks[0][url]
        const rawLinks = Object.values(req.body.socialLinks || {});
        footer.socialLinks = rawLinks
            .filter(link => link.url && link.url.trim() !== "")
            .map(link => ({
                name: link.name?.trim() || "Link",
                url: link.url.trim()
            }));

        footer.copyright = {
            year: req.body.year?.trim() || "",
            name: req.body.name?.trim() || ""
        };

        await footer.save();
        res.redirect(`/${req.user.username}/portfolio`);

    } catch (err) {
        console.log("FOOTER UPDATE ERROR:", err);
        res.status(500).send("Server error");
    }
});




export default router;