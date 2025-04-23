const urlParams = new URLSearchParams(window.location.search);

window.addEventListener("load", async () => {
    await loadPage();

    await Include();
    await Icons();
    await main();
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
                
                // Create a temporary container to parse HTML
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Extract and execute scripts
                const scripts = temp.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        // External script (load via src)
                        newScript.src = script.src;
                    } else {
                        // Inline script (copy content)
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript); // Execute in global scope
                });

                // Replace the <include> with the parsed HTML (without scripts)
                el.outerHTML = temp.innerHTML;
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

// Main

async function main() {
    await loadHyperLinks();
}

async function loadPage() {
    var body = document.querySelectorAll("body")[0];
    var page = document.getElementById("page");
    
    // Load Page
    var pageName = urlParams.get("page") ?? "store";
    page.setAttribute("src", "Pages/" + pageName + ".html") // Load page's HTML
    body.style.backgroundImage = "linear-gradient(rgba(34,34,34,1), rgba(34,34,34,.95)), url(Backgrounds/" + pageName + ".png)"; // Load page's Background Image
}

async function loadHyperLinks() {

    Object.entries(hyperlinks).forEach(([key, value]) => {
        var elements = document.getElementsByName(key);

        elements.forEach(element => {
            element.href = value;
        });
    });
}

function loadRoadmap() {

    fetch(roadmapSheet)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\n").map(row => row.split(","));
            const table = document.createElement("table");

            rows.forEach((row, index) => {
                const tr = document.createElement("tr");
                row.forEach(cell => {
                    const cellElement = document.createElement(index === 0 ? "th" : "td");
                    cellElement.textContent = cell;
                    tr.appendChild(cellElement);
                });
                table.appendChild(tr);
            });
            
            echo(table.outerHTML);
        });
}

// echo
function echo(html) {
    document.body.insertAdjacentHTML('beforeend', html);
}