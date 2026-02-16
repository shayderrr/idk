const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { fetchURL } = require("../fetch.js");
const fs = require("fs");
const path = require("path");
const dejson = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/deledao.json'), 'utf8'));

async function deledao(url) {
    const AUTH_TOKEN = "56afc0786f82c9e6fc4d49b5e63789dd";

    // Normalize URL once at the start
    let normalizedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        normalizedUrl = "http://" + url;
    }

    // Start both fetches in parallel
    const categoryPromise = fetchURL("https://cc.deledao.com/GetCategory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            version: "1.2",
            auth: AUTH_TOKEN,
            hostlist: [url],
        }),
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const htmlPromise = fetchURL(normalizedUrl, { signal: controller.signal })
        .then(res => res.text())
        .catch(e => null)
        .finally(() => clearTimeout(timeoutId));

    // Wait for category check first
    const res = await categoryPromise;

    if (!res.ok) {
        console.warn(`GetCategory failed: ${res.status}`);
        return `Error`;
    }

    const data = await res.json();
    const domainCats = data.DomainCategoryList ?? [];

    // Fast path: domain is categorized
    if (domainCats.length > 0 && domainCats[0]?.Cats?.[0] !== 0) {
        const catId = domainCats[0].Cats[0];
        
        const cat = dejsonMap.get(catId);
        if (cat) {
            return [cat.name, cat.blocked];
        }
        return ["Uncategorized", true];
    }

    // Slow path: HTML is already being fetched in parallel!
    const htmlText = await htmlPromise;
    
    if (!htmlText || htmlText.trim().length === 0) {
        return ["Uncategorized", true];
    }

    try {
        const dom = new JSDOM(htmlText);
        const text = dom.window.document.documentElement.textContent;

        const res2 = await fetchURL("https://tx.deledao.com/GetTextCategory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                version: "1.2",
                auth: AUTH_TOKEN,
                url: normalizedUrl,
                textArray: [{
                    text,
                    lang: "en"
                }],
            }),
        });

        if (!res2.ok) {
            console.warn(`GetTextCategory failed: ${res2.status}`);
            return `Error`;
        }

        const jsonn = await res2.json();
        const result = jsonn.Results[0].Categories[0];

        const cat = dejsonMap.get(result.Id);
        const blocked = cat ? cat.blocked : true;

        return [result.Label, blocked, result.Prob];
        
    } catch (e) {
        return ["Uncategorized", true];
    }
}
const dejsonMap = new Map(dejson.map(cat => [cat.category_number, cat]));

module.exports = { deledao };