import express from "express";
const router = express.Router({ mergeParams: true });

import Skill from "../../models/skill.js";
import { isLoggedIn } from "../../middleware.js";

import { loadUserPortfolio } from "../../middleware.js";
import { loadSelectedSkill } from "../../middleware.js";    
import { loadSelectedTopic } from "../../middleware.js";


// ================= EDIT TOPIC =================
router.get(
    "/:skillSlug/:topicId/edit",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    (req, res) => {

        res.render("admin/skill/edittopic.ejs", {
            user: req.user,
            selectedSkill: req.selectedSkill,
            topic: req.selectedTopic
        });
    }
);


// ================= UPDATE TOPIC =================
router.put(
    "/:skillSlug/:topicId",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    async (req, res) => {
        try {
            const { topicName } = req.body;

            if (!topicName || !topicName.trim()) {
                return res.send("Topic name is required");
            }

            // 🔥 directly update in memory
            req.selectedTopic.topicName = topicName.trim();

            // 🔥 save parent document
            await req.selectedSkill.save();

            res.redirect(
                `/${req.user.username}/portfolio/skills/${req.selectedSkill.slug}#skillsSection`
            );

        } catch (err) {
            console.log("UPDATE TOPIC ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);

// ================= DELETE TOPIC =================
router.delete(
    "/:skillSlug/:topicId",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    async (req, res) => {
        try {
            // 🔥 remove topic from array
            req.selectedSkill.topics.pull(req.selectedTopic._id);

            // 🔥 save parent document
            await req.selectedSkill.save();

            res.redirect(
                `/${req.user.username}/portfolio/skills/${req.selectedSkill.slug}#skillsSection`
            );

        } catch (err) {
            console.log("DELETE TOPIC ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);


// ================= ADD CORE SKILL PAGE =================
router.get(
    "/:skillSlug/:topicId/addcoreskill",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    (req, res) => {

        res.render("admin/skill/addcoreskill.ejs", {
            user: req.user,                      // ✅ IMPORTANT
            selectedSkill: req.selectedSkill,
            selectedTopic: req.selectedTopic
        });
    }
);


// ================= ADD CORE SKILL =================
router.post(
    "/:skillSlug/:topicId/addcoreskill",
    isLoggedIn,
    loadUserPortfolio,
    loadSelectedSkill,
    loadSelectedTopic,
    async (req, res) => {
        try {
            const { coreSkill } = req.body;

            if (!coreSkill || !coreSkill.trim()) {
                return res.send("Core skill name is required");
            }

            // 🔥 push directly using middleware data
            req.selectedTopic.coreSkills.push({
                name: coreSkill.trim()
            });

            // 🔥 save parent document
            await req.selectedSkill.save();

            res.redirect(
                `/${req.user.username}/portfolio/skills/${req.selectedSkill.slug}#skillsSection`
            );

        } catch (err) {
            console.log("ADD CORE SKILL ERROR:", err);
            res.status(500).send("Server error");
        }
    }
);

export default router;