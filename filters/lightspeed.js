const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const lightspeedjson = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/lightspeed.json'), 'utf8'));

function lightspeedCategorize(num) {
	for (let i = 0; i < lightspeedjson.length; i++) {
		if (lightspeedjson[i]["CategoryNumber"] == num) {
			return [lightspeedjson[i]["CategoryName"], (lightspeedjson[i]["Allow"] == 1)]
		}
	}
	return num
}

async function lightspeed(url) {
	return new Promise((resolve, reject) => {
	const ws = new WebSocket(
	  "wss://production-gc.lsfilter.com?a=0ef9b862-b74f-4e8d-8aad-be549c5f452a&customer_id=74-1082-F000&agentType=chrome_extension&agentVersion=3.777.0&userGuid=00000000-0000-0000-0000-000000000000"
	);

	ws.on("open", () => {
	  ws.send(
		JSON.stringify({
		  action: "dy_lookup",
		  host: url,
		  ip: "174.85.104.135",
		  customerId: "74-1082-F000",
		})
	  );
	});

	ws.on("message", (msg) => {
	  ws.close();
	  let json = JSON.parse(msg.toString())
	  let categoryy = lightspeedCategorize(json.cat);
	  resolve(categoryy ? categoryy : ["Uncategorized", false]);
	});

	ws.on("error", (err) => {
	  reject(err);
	});
	});
}

module.exports = {lightspeed};