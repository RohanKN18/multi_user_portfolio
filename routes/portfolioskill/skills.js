import express from "express";
const router = express.Router({ mergeParams: true });

import { generateSlug } from "../../utils/slugify.js";
import Skill from "../../models/skill.js";
import { isLoggedIn } from "../../middleware.js";

import { loadUserPortfolio } from "../../middleware.js";
import { loadSelectedSkill } from "../../middleware.js";    


// ================= ADD TOPIC PAGE =================
router.get(
    "/:skillSlug/addtopics",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    (req, res) => {

        res.render("admin/skill/addtopics.ejs", {
    user: req.user,
    selectedSkill: req.selectedSkill,
    skills: req.portfolio.skills   // ← add this
});
    }
);


// ================= ADD TOPIC =================
router.post(
    "/:skillSlug/addtopics",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    async (req, res) => {
        try {
            const { topic } = req.body;

            if (!topic || !topic.trim()) {
                return res.send("Topic name is required");
            }

            const skill = req.selectedSkill;

            skill.topics.push({
                topicName: topic.trim(),
                coreSkills: []
            });

            await skill.save();

            res.redirect(
                `/${req.user.username}/portfolio/skills/${skill.slug}#skillsSection`
            );

        } catch (err) {
            console.log("ADD TOPIC ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);


// ================= EDIT SKILL PAGE =================
router.get(
    "/:skillSlug/edit",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    (req, res) => {

       res.render("admin/skill/editskill.ejs", {
    user: req.user,
    selectedSkill: req.selectedSkill,
    skills: req.portfolio.skills   // ← add this
});
    }
);


// ================= UPDATE SKILL =================
router.post(
    "/:skillSlug/edit",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    async (req, res) => {
        try {

            const skill = req.selectedSkill;

            if (!req.body.skillName || !req.body.skillName.trim()) {
                return res.send("Skill name is required");
            }

            let baseSlug = generateSlug(req.body.skillName);
            let slug = baseSlug;
            let count = 1;

            while (await Skill.findOne({
                slug,
                _id: { $ne: skill._id },
                owner: req.user._id
            })) {
                slug = `${baseSlug}-${count++}`;
            }

            skill.skillName = req.body.skillName.trim();
            skill.slug = slug;

            await skill.save();

            res.redirect(`/${req.user.username}/portfolio/skills/${slug}#skillsSection`);

        } catch (err) {
            console.log("EDIT SKILL POST ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);


// ================= DELETE SKILL =================
router.delete(
    "/:skillSlug",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    async (req, res) => {
        try {
            await Skill.findByIdAndDelete(req.selectedSkill._id);

            res.redirect(`/${req.user.username}/portfolio#skillsSection`);

        } catch (err) {
            console.log("DELETE SKILL ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);


// ================= SKILL DETAIL =================
router.get(
    "/:skillSlug",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    (req, res) => {

        res.render("admin/skillindetail.ejs", {
            user: req.user,                 // ✅ IMPORTANT
            selectedSkill: req.selectedSkill,
            ...req.portfolio,
            scrollTo: "skillsSection"
        });
    }
);

export default router;