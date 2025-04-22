const urlParams = new URLSearchParams(window.location.search);

document.addEventListener("DOMContentLoaded", async () => {
    await Include();
    await Icons();
});

// Includes
async function Include() {
    const includeTags = document.querySelectorAll("include[src]");
    for (const el of includeTags) {
        const file = el.getAttribute("src");
        try {
            const res = await fetch(file);
            if (res.ok) {
                const html = await res.text();
                el.outerHTML = html;
            } else {
                el.outerHTML = `<!-- Failed to load ${file} -->`;
            }
        } catch (err) {
            el.outerHTML = `<!-- Error loading ${file}: ${err.message} -->`;
        }
    }
}

// Icons
async function Icons() {
    const iconTags = document.querySelectorAll("icon[src]");
    for (const el of iconTags) {
        const iconName = el.getAttribute("src");
        const style = false ? "solid" : "24/outline";
        const el_class = el.getAttribute("class");
        const url = `https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/${style}/${iconName}.svg`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Icon not found");

            const svgText = await response.text();
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = svgText;
            const svg = tempDiv.querySelector("svg");

            svg.setAttribute('class', el_class);
            svg.style.filter = "invert(1)";

            if (svg) {
                el.replaceWith(svg);
            }
        } catch (err) {
            console.error(`Failed to load icon "${iconName}":`, err);
        }
    }
}

// echo
function echo(html) {
    document.body.insertAdjacentHTML('beforeend', html);
}