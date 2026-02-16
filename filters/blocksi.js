const { fetchURL } = require("../fetch.js");
const fs = require("fs");
const path = require("path");
const blocksijson = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/blocksi.json'), 'utf8'));

async function blocksiAI(domain) {
	try {
		const res = await fetchURL("https://api.blocksi.net/url-classifier-llm/predict_url", {
			method: "POST",
			headers: {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9",
				"authorization": "Basic QXp6YXo6QmxvY2tzaUthcmlt",
				"cookie": "messagesUtk=7c549d6aa50b45909d79e1cf7a1ad085",
				"content-type": "application/json"
			},
			body: JSON.stringify({
				url: domain
			})
		});
		let json = await res.json();
		let category = null;
		let shouldBeBlocked = true;
		if ("document" in json) {
			category = json.document.predicted_specific_category;
		} else {
			category = json.predicted_specific_category;
		}
		for (const key in blocksijson["ai"]) {
			if (!Object.hasOwnProperty.call(blocksijson["ai"], key)) continue;
			let entry = blocksijson["ai"][key];
			if (entry.name === category && entry.blocked === false) {
				shouldBeBlocked = false;
				break;
			}
		}
		let returnobj = [(category === "Specific Category" ? "Unknown" : category), shouldBeBlocked];
		return returnobj;
	} catch (err) {
		console.warn("Blocksi AI Error: " + err);
		return `Error`;
	}
}
async function blocksiStandard(domain) {
	try {
		const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
		const res = await fetchURL("https://service1.blocksi.net/getRating.json?url=" + cleanDomain);
		const html = await res.text();
		try {
			const json = JSON.parse(html);
			const categoryCode = String(json.Category);
			const category = blocksijson.web[categoryCode];
			return [(category.cat + ": " + category.name), category.blocked] || "";
		} catch (er) {
			return ["Broken rn", true];
		}
	} catch (err) {
		console.warn("Blocksi Standard Error: " + err);
		return `Error`;
	}
}

module.exports = {blocksiAI, blocksiStandard};