// ================= SKILL HELPERS =================

export function getSkill(res, skillSlug) {
    return res.locals.skills.find(s => s.slug === skillSlug);
}

export function getSkillAndTopic(res, skillSlug, topicId) {
    const selectedSkill = getSkill(res, skillSlug);

    const selectedTopic = selectedSkill?.topics.find(
        t => t._id.toString() === topicId.trim()
    );

    return { selectedSkill, selectedTopic };
}
export function getCoreSkill(selectedTopic, coreId) {
    return selectedTopic?.coreSkills.find(
        c => c._id.toString() === coreId.trim()
    );
}

// ================= PROJECT HELPERS =================

export function getProject(req, slug) {
    return req.app.locals.projects.find(
        p => p.projectSlug === slug
    );
}