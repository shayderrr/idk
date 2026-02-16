const { fetchURL } = require("../fetch.js");
const fs = require("fs");
const path = require("path");
const sensocats = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/senso.json'), 'utf8'));

async function sensocloud(urlToCheck) {
	try {
		let response = await fetchURL("https://filtering.senso.cloud/filter/lookup?url=https://" + urlToCheck);
		let json = await response.json();
		let cats = ".";
		let blocked = false;
		for (const cat of json) {
			if (sensocats[cat]) {
				if (cats === ".") {
					cats = sensocats[cat][0];
				} else {
					cats = cats + (cats === "" ? "" : ", ") + sensocats[cat][0];
				}
				blocked = blocked ? true : sensocats[cat][1];
			}
		}
		if (cats === ".") {
			cats = "Uncategorized"
			blocked = true;
		}
		return [cats === "" ? "Uncategorized" : cats, blocked];
	} catch (err) {
		console.warn("Senso Error: " + err);
		return `Error`;
	}
}

module.exports = {sensocloud};