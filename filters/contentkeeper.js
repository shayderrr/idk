const fs = require("fs");
const path = require("path");
const { fetchURL } = require("../fetch.js");
const ckjson = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/contentkeeper.json'), 'utf8'));

async function contentkeeper(url) {
    try {
    const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const response = await fetchURL('https://ckf01.barringtonschools.org/cgi-bin/ck/re_u.cgi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        USER: '',
        URL_AREA: domain,
        NUM_SUBMIT_URL: '1',
        SEL_1: '29',
        CAT_1: '-1',
        URL_1: domain,
        DAT_1: 'Global',
        SUBMIT_SITE_SECOND_CANCEL: 'Cancel'
      })
    });

    const html = await response.text();
	let category = "";
	try {
		category = html.split("<td align='LEFT' style='color: Blue;'>")[1].split("</td>")[0]
	} catch(e) {
		category = html.split("<td align='LEFT' style='color: #ff0000;'>")[1].split("</td>")[0].trim()
	}
    const isBlocked = ckjson[category] ? (ckjson[category] === "B" ? true : false) : true;
    const loc = html.split("<input type='Hidden' name='DAT_1' value='")[1].split("'>")[0]
	category = category+" ("+(loc === "n/a" ? "Global" : loc)+")"

    return {
      blocked: isBlocked,
      category: category
    };
  } catch (error) {
    console.warn("ContentKeeper Error: " + error);
    return `Error`;
  }
}

module.exports = {contentkeeper};