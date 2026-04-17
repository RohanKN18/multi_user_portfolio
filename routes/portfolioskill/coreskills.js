import express from "express";
const router = express.Router({ mergeParams: true });

import Skill from "../../models/skill.js";
import { isLoggedIn } from "../../middleware.js";

import { loadUserPortfolio } from "../../middleware.js";
import { loadSelectedSkill } from "../../middleware.js";    
import { loadSelectedTopic } from "../../middleware.js";
import { loadSelectedCoreSkill } from "../../middleware.js";


// ================= EDIT CORE SKILL =================
router.get(
    "/:skillSlug/:topicId/:coreId/edit",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    loadSelectedCoreSkill,
    (req, res) => {

        res.render("admin/skill/editcore.ejs", {
            user: req.user,                        // ✅ IMPORTANT
            selectedSkill: req.selectedSkill,
            selectedTopic: req.selectedTopic,
            coreSkill: req.selectedCoreSkill
        });
    }
);


// ================= UPDATE CORE SKILL =================
router.post(
    "/:skillSlug/:topicId/:coreId/edit",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    loadSelectedCoreSkill,
    async (req, res) => {
        try {
            const { coreName } = req.body;

            if (!coreName || !coreName.trim()) {
                return res.send("Core skill name is required");
            }

            // 🔥 update directly
            req.selectedCoreSkill.name = coreName.trim();

            // 🔥 save parent
            await req.selectedSkill.save();

            res.redirect(
                `/${req.user.username}/portfolio/skills/${req.selectedSkill.slug}#skillsSection`
            );

        } catch (err) {
            console.log("UPDATE CORE SKILL ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);

// ================= DELETE CORE SKILL =================
router.delete(
    "/:skillSlug/:topicId/:coreId",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    loadSelectedCoreSkill,
    async (req, res) => {
        try {
            // 🔥 remove core skill
            req.selectedTopic.coreSkills.pull(req.selectedCoreSkill._id);

            // 🔥 save parent
            await req.selectedSkill.save();

            res.redirect(
                `/${req.user.username}/portfolio/skills/${req.selectedSkill.slug}#skillsSection`
            );

        } catch (err) {
            console.log("DELETE CORE SKILL ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);
export default router;