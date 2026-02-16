const fs = require("fs");
const path = require("path");
const fortiguardcategories = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/fortiguard.json'), 'utf8'));
const { fetchURL } = require("../fetch.js");

async function fortiguard(url) {
	try {
		let res = await fetchURL(
			"https://wsfgd1.fortiguard.net:3400/service/wfquery" +
			"?protver=1.0" +
			"&cltkey=bossbaby" +
			"&emssn=lol" +
			"&clttype=ie" +
			"&type=cate" +
			"&catver=10" +
			"&qurl=" + encodeURIComponent(url)
		);

		let rJson = await res.json();

		try {
			const cats = rJson["data"] || [];

			let names = [];
			let blocked = false;

			for (const cat of cats) {
				const info = fortiguardcategories[cat] || {
					category: "Unknown",
					blocked: true
				};
				names.push(info.category);
				if (!blocked) blocked = info.blocked;
			}

			return {
				category: names.join(", "),
				blocked: blocked
			};

		} catch (err) {
			return {
				category: "Not Rated",
				blocked: true
			};
		}

	} catch (err) {
		console.warn("Fortiguard Error: " + err);
		return `Error`;
	}
}

module.exports = {fortiguard}