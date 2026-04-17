import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import Project from "../models/project.js";
import { isLoggedIn } from "../middleware.js";
import { generateSlug } from "../utils/slugify.js";


// ================= ADD PROJECT PAGE =================
router.get("/addproject", isLoggedIn, (req, res) => {
    res.render("admin/project/addproject.ejs", {
        user: req.user // optional but useful
    });
});


// ================= CREATE PROJECT =================
router.post("/addproject", isLoggedIn, async (req, res) => {
    try {
        const {
            projectName,
            projectSlug,
            description,
            image,
            githubLink,
            liveLink,
            role,
            status,
            startDate,
            endDate
        } = req.body;

        // ✅ fallback slug if not provided
        let slug = projectSlug && projectSlug.trim()
            ? generateSlug(projectSlug)
            : generateSlug(projectName);

        let baseSlug = slug;
        let count = 1;

        // ✅ ensure unique slug per user
        while (await Project.findOne({ projectSlug: slug, owner: req.user._id })) {
            slug = `${baseSlug}-${count++}`;
        }

        const newProject = new Project({
            owner: req.user._id,
            projectName,
            projectSlug: slug,
            description,
            image,
            githubLink,
            liveLink: liveLink || null,

            techStack: {
                languages: req.body.languages
                    ? req.body.languages.split(",").map(x => x.trim())
                    : [],
                frameworks: req.body.frameworks
                    ? req.body.frameworks.split(",").map(x => x.trim())
                    : [],
                databases: req.body.databases
                    ? req.body.databases.split(",").map(x => x.trim())
                    : [],
                tools: req.body.tools
                    ? req.body.tools.split(",").map(x => x.trim())
                    : []
            },

            features: req.body.features
                ? req.body.features.split(",").map(x => x.trim())
                : [],

            highlights: req.body.highlights
                ? req.body.highlights.split(",").map(x => x.trim())
                : [],

            role,
            status,
            startDate,
            endDate
        });

        await newProject.save();

        // ✅ FIXED redirect
        return res.redirect(`/${req.user.username}/portfolio`);

    } catch (err) {
        console.log("Add Project Error:", err);
        res.status(500).send("Server error");
    }
});


// ================= EDIT PAGE =================
router.get("/:projectId/edit", isLoggedIn, async (req, res) => {
    try {
        const { projectId } = req.params;

        // ✅ validate ID (prevents crash)
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).send("Invalid project ID");
        }

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user._id // ✅ security
        });

        if (!project) {
            return res.status(404).send("Project not found");
        }

        res.render("admin/project/editproject.ejs", {
            project,
            user: req.user // optional but useful
        });

    } catch (err) {
        console.log("Edit Page Error:", err);
        res.status(500).send("Server error");
    }
});


// ================= UPDATE PROJECT =================


router.post("/:projectId/edit", isLoggedIn, async (req, res) => {
    try {
        const { projectId } = req.params;

        // ✅ prevent crash
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).send("Invalid project ID");
        }

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user._id // ✅ security
        });

        if (!project) {
            return res.status(404).send("Project not found");
        }

        // ✅ update fields
        Object.assign(project, {
            projectName: req.body.projectName,
            projectSlug: req.body.projectSlug,
            description: req.body.description,
            image: req.body.image,
            githubLink: req.body.githubLink,
            liveLink: req.body.liveLink,
            role: req.body.role,
            status: req.body.status,
            startDate: req.body.startDate,
            endDate: req.body.endDate,

            techStack: {
                languages: req.body.languages
                    ? req.body.languages.split(",").map(s => s.trim())
                    : [],
                frameworks: req.body.frameworks
                    ? req.body.frameworks.split(",").map(s => s.trim())
                    : [],
                databases: req.body.databases
                    ? req.body.databases.split(",").map(s => s.trim())
                    : [],
                tools: req.body.tools
                    ? req.body.tools.split(",").map(s => s.trim())
                    : []
            },

            features: req.body.features
                ? req.body.features.split(",").map(s => s.trim())
                : [],

            highlights: req.body.highlights
                ? req.body.highlights.split(",").map(s => s.trim())
                : []
        });

        await project.save();

        // ✅ FIXED redirect
        return res.redirect(`/${req.user.username}/portfolio/projects/${project._id}`);

    } catch (err) {
        console.log("Update Error:", err);
        res.status(500).send("Server error");
    }
});


// ================= DELETE =================


router.delete("/:projectId", isLoggedIn, async (req, res) => {
    try {
        const { projectId } = req.params;

        // ✅ prevent crash
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).send("Invalid project ID");
        }

        const deletedProject = await Project.findOneAndDelete({
            _id: projectId,
            owner: req.user._id // ✅ security
        });

        if (!deletedProject) {
            return res.status(404).send("Project not found");
        }

        // ✅ FIXED redirect
        return res.redirect(`/${req.user.username}/portfolio`);

    } catch (err) {
        console.log("Delete Error:", err);
        res.status(500).send("Server error");
    }
});


// ================= VIEW PROJECT =================
router.get("/:projectId", isLoggedIn, async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user._id // ✅ security
        });

        if (!project) {
            return res.status(404).send("Project not found");
        }

        res.render("admin/projectindetail.ejs", {
            project,
            user: req.user // optional but useful in EJS
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

export default router;