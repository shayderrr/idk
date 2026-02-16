const { fetchURL } = require("../fetch.js");
const fs = require("fs");
const path = require("path");
const ciscoblocked = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/ciscoblocked.json'), 'utf8'));

async function cisco(domain) {
	try {
		domain = domain.replace("https://", "").replace("http://", "").split("/")[0];
		const res = await fetchURL(`https://talosintelligence.com/cloud_intel/url_reputation?url=${domain}`);
		const json = await res.json();
		let jsons;
		try {
			jsons = json.reputation.aup_cat;
		} catch(err){
			return ["Not rated", true];
		}
		let categories = [];
		for (const jsonobj of jsons) {
			categories.push(jsonobj.name);
		}
		if (categories.length === 0) {
			categories = ["Not rated"];
		}
		let isBlocked = false;
		let categoryString = "";
		categories.forEach((category, index) => {
			if (ciscoblocked.includes(category)) {
				isBlocked = true;
			}
			categoryString += category + (index === categories.length - 1 ? "" : ", ");
		});
		return [categoryString, isBlocked];
	} catch (err) {
		console.warn("Cisco Error: " + err);
		return `Error`;
	}
}

module.exports = { cisco };