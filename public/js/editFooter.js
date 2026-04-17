let index = <%= footer?.socialLinks?.length || 1 %>;

    document.getElementById("addSocialBtn").addEventListener("click", () => {
        const container = document.getElementById("socialContainer");

        const div = document.createElement("div");
        div.classList.add("formGroup");

        div.innerHTML = `
            <label>Name</label>
            <input type="text" name="socialLinks[${index}][name]" placeholder="Platform">

            <label>URL</label>
            <input type="text" name="socialLinks[${index}][url]" placeholder="https://...">
        `;

        container.appendChild(div);
        index++;
    });