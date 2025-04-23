const urlParams = new URLSearchParams(window.location.search);

window.addEventListener("load", async () => {
    await loadPage();

    await Include();
    await Icons();
    await loadHyperLinks();
});

// Include
async function Include() {
    const includeTags = document.querySelectorAll("include[src]");
    const scriptsToRun = [];

    for (const el of includeTags) {
        const file = el.getAttribute("src");
        try {
            const res = await fetch(file);
            if (res.ok) {
                const html = await res.text();

                // Create a temporary container to parse HTML
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Extract scripts for later execution
                const scripts = temp.querySelectorAll('script');
                scripts.forEach(script => script.remove()); // Remove scripts from HTML

                // Replace the <include> with the parsed HTML (no scripts)
                el.outerHTML = temp.innerHTML;

                // Save scripts for later
                scripts.forEach(script => {
                    scriptsToRun.push(script);
                });
            } else {
                el.outerHTML = `<!-- Failed to load ${file} -->`;
            }
        } catch (err) {
            el.outerHTML = `<!-- Error loading ${file}: ${err.message} -->`;
        }
    }

    // Execute scripts after all includes are done
    for (const script of scriptsToRun) {
        const newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
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

async function loadPage() {
    var body = query("body")[0];
    var page = query("#page")[0];

    // Load Page
    var pageName = urlParams.get("page") ?? "store";
    page.setAttribute("src", "Pages/" + pageName + ".html") // Load page's HTML
    body.style.backgroundImage = "linear-gradient(rgba(34,34,34,1), rgba(34,34,34,.95)), url(Backgrounds/" + pageName + ".png)"; // Load page's Background Image
}

async function loadHyperLinks() {

    Object.entries(hyperlinks).forEach(([key, value]) => {
        var elements = query(`[name=${key}]`);

        elements.forEach(element => {
            element.href = value;
        });
    });
}

async function loadRoadmap() {
    return fetch(roadmapSheet)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\n").map(row => row.split(","));
            const table = document.createElement("table");

            while (rows.length < 8) {
                rows.push(new Array(rows[0].length).fill(''));
            }

            // Create the table rows
            rows.forEach((row, index) => {
                const tr = document.createElement("tr");
                row.forEach(cell => {
                    const cellElement = document.createElement(index === 0 ? "th" : "td");
                    cellElement.textContent = cell;
                    tr.appendChild(cellElement);
                });
                table.appendChild(tr);
            });

            return table.outerHTML;
        });
}


// echo
function echo(html, element) {
    if (typeof element == "string") {
        element = query(element);
    }

    if (element) {
        element.insertAdjacentHTML('beforeend', html);
        // document.getElementById("roadmap").insertAdjacentHTML('beforeend', html);
    } else {
        document.body.insertAdjacentHTML('beforeend', html);
    }
}


// query
const query = (selector, context = document) => Array.from(context.querySelectorAll(selector));