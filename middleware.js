

import User from "./models/user.js";

import Skill from "./models/skill.js";
import Project from "./models/project.js";
import Greeting from "./models/greeting.js";
import Education from "./models/education.js";
import Footer from "./models/footer.js";



export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/loginfail");
    }
    next();
};


export const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send("User not found getUserByUsername");
        }

        // attach user to request object
        req.user = user;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};




export const loadUserPortfolio = async (req, res, next) => {
    try {
        const user = req.user; // already set by your user middleware

        const [skills, projects, greeting, education, footer] = await Promise.all([
            Skill.find({ owner: user._id }),
            Project.find({ owner: user._id }).sort({ createdAt: -1 }),
            Greeting.findOne({ owner: user._id }),
            Education.find({ owner: user._id }).sort({ createdAt: 1 }),
            Footer.findOne({ owner: user._id })
        ]);

        // attach everything to request
        req.portfolio = {
            skills,
            projects,
            greeting,
            education,
            footer
        };

        next();

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading portfolio");
    }
};


export const loadSelectedSkill = (req, res, next) => {
    const { skillSlug } = req.params; // ✅ FIX

    if (!req.portfolio || !req.portfolio.skills) {
        return res.status(500).send("Portfolio not loaded");
    }

    const selectedSkill = req.portfolio.skills.find(
        s => s.slug === skillSlug
    );

    if (!selectedSkill) {
        return res.status(404).send("Skill not found in middleware");
    }

    req.selectedSkill = selectedSkill;

    next();
};

export const loadSelectedTopic = (req, res, next) => {
    const { topicId } = req.params;

    if (!req.selectedSkill || !req.selectedSkill.topics) {
        return res.status(500).send("Skill not loaded");
    }

    const topic = req.selectedSkill.topics.find(
        t => t._id.toString() === topicId
    );

    if (!topic) {
        return res.status(404).send("Topic not found");
    }

    req.selectedTopic = topic;

    next();
};

export const loadSelectedCoreSkill = (req, res, next) => {
    const { coreId } = req.params;

    if (!req.selectedTopic || !req.selectedTopic.coreSkills) {
        return res.status(500).send("Topic not loaded");
    }

    const coreSkill = req.selectedTopic.coreSkills.find(
        c => c._id.toString() === coreId
    );

    if (!coreSkill) {
        return res.status(404).send("Core skill not found");
    }

    req.selectedCoreSkill = coreSkill;

    next();
};


export const loadSelectedProject = (req, res, next) => {
    const { slug } = req.params;

    const project = req.portfolio.projects.find(
        p => p.projectSlug === slug
    );

    if (!project) {
        return res.status(404).send("Project not found");
    }

    req.selectedProject = project;
    next();
};


export const attachUsername = (req, res, next) => {
    if (req.user) {
        req.username = req.user.username;
    }
    next();
};


