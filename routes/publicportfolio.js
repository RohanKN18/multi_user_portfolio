import express from "express";
const router = express.Router();

import User from "../models/user.js";
import Skill from "../models/skill.js";
import Project from "../models/project.js";

import { getUserByUsername } from "../middleware.js";
import { loadUserPortfolio } from "../middleware.js";
import { loadSelectedSkill } from "../middleware.js";
import { loadSelectedProject } from "../middleware.js";


// ================= GET FULL PORTFOLIO =================
router.get(
    "/:username/publicportfolio",
    getUserByUsername,
    loadUserPortfolio,
    async (req, res) => {

        res.render("public/publicportfolio.ejs", {
            user: req.user,
            ...req.portfolio
        });
    }
);

// ================= GET SKILL DETAIL =================
router.get("/:username/publicportfolio/skills/:skillSlug",
    getUserByUsername,
    loadUserPortfolio,
    loadSelectedSkill,
    (req, res) => {

        res.render("public/publicskillindetail.ejs", {
            user: req.user,
            ...req.portfolio,
            selectedSkill: req.selectedSkill,
            scrollTo: "skillsSection"
        });
    }
);



// ================= GET PROJECT DETAIL =================
router.get(
    "/:username/publicportfolio/projects/:slug",
    getUserByUsername,
    loadUserPortfolio,
    loadSelectedProject,
    (req, res) => {

        res.render("public/publicprojectdetails.ejs", {
            user: req.user,
            project: req.selectedProject,
            ...req.portfolio,
            scrollTo: "projectsSection"
        });
    }
);

export default router;