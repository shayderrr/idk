const { fetchURL } = require("../fetch.js");
const fetchCookie = require("fetch-cookie").default;
const { CookieJar } = require("tough-cookie");
const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetchURL, jar);

async function securly(url) {
    try {
        let raw = url.includes("://") ? url.split("://")[1] : url;
        raw = raw.split("?")[0].split("#")[0];
        const encodedUrl = Buffer.from(raw).toString("base64");
        const res = await fetchWithCookies(
            `https://uswest-www.securly.com/crextn/broker?useremail=admin@edison.k12.ca.us&chrome=true&reason=crextn&version=-&cu=https://uswest-www.securly.com/crextn&uf=1&cf=1&host=${raw}&url=${encodedUrl}`
        );
        const html = await res.text();
        const [status, policyid, categoryid] = html.split(":");
        const res2 = await fetchWithCookies(
            `https://www.securly.com/blocked?useremail=admin@edison.k12.ca.us&chrome=true&reason=globalblacklist&keyword=&extension_id=kfiocjonplkilcjfgabfngiddebalkod&extension_version=3.0.21&categoryid=${categoryid}&policyid=${policyid}&url=${encodedUrl}`
        );
        const html2 = await res2.text();
        const category = html2.split(`params['categories'] = "`)[1]?.split(`"`)[0] || "Unknown";
        return [category,status.replace("\n","") === "ALLOW" ? false : true];
    } catch (err) {
        console.warn("Securly Error:", err);
		return `Error`;
    }
}

module.exports = {securly};