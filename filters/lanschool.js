const { fetchURL } = require("../fetch.js");
const fs = require("fs");
const path = require("path");
const lanschooljson = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/lanschool.json'), 'utf8'));

async function lanschool(url) {
	try {
		url = 'https://' + url;
		let aa = btoa(`001 ${url} - - - - 3372822944`)
		const res = await fetchURL("https://filter.coopacademiescloud.netsweeper.com:3431/" + aa);
		const text = await res.text();
		if (text.startsWith('ALLOW')) {
			return 'LanSchool';
		} else {
			let url = text.split(' ')[0];
			let cat = url.split("&cat=")[1].split("&")[0]
			return lanschooljson[`${cat}`];
		}
	} catch (err) {
		console.warn("Lanschool Error: " + err);
		return `Error`;
	}
}

module.exports = {lanschool};