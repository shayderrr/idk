const WebSocket = require("ws");

async function aristotlek12(urlToCheck) {
	try {
		function generateUUID() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				const r = Math.random() * 16 | 0;
				const v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}

		const DOMAIN = 'hamiltoncstn.aristotleinsight.com';
		const PATH = '/wss/wf';
		const AUTH_KEY = 'aristotle-chrome-agent';
		const AUTH_SECRET = 'bc49421b5659aa068f58f37986e8485bfb9d0de3c8b7bc52bdbcae18903a443c0b039339039440f943fb8bc42019ffa8a2658fc1a149ee686f18bf830b47ee85';

		const ssId = generateUUID();
		const wsUrl = `wss://${DOMAIN}${PATH}?ssId=${ssId}`;

		return new Promise((resolve, reject) => {
			try {
				const ws = new WebSocket(wsUrl);

				ws.on('open', () => {
					const authMessage = {
						cmd: 0,
						auth: true,
						key: AUTH_KEY,
						secret: AUTH_SECRET,
						guid: generateUUID(),
						os: 'win',
						user_id: 'testuser',
						connect_time: new Date().toUTCString(),
						version: '1.0.0'
					};

					ws.send(JSON.stringify(authMessage));
				});

				ws.on('message', (event) => {
					const data = JSON.parse(event.toString());
					if (data.authenticated !== undefined) {
						if (data.authenticated) {
							const msgId = generateUUID();
							const checkMessage2 = {
								cmd: 2,
								msgId: msgId,
								url: urlToCheck,
								type: 'main_frame'
							};
							ws.send(JSON.stringify(checkMessage2));
						} else {
							ws.close();
							reject(new Error('Authentication failed!'));
						}
					}

					if (data.msgId) {
						ws.close();
						resolve({
							category: data.category || data.block_type,
							blocked: data.block
						});
					}
				});

				ws.on('error', (error) => {
					ws.close();
					console.warn("Aristotle Error: " + error);
					resolve('Error');
				});

				ws.on('close', () => {
					reject(new Error('WebSocket closed before receiving response'));
				});
			} catch (err) {
				console.warn("Aristotle Error: " + err);
				return `Error`;
			}
		});
	} catch (err) {
		console.warn("Aristotle Error: " + err);
		return `Error`;
	}
}

module.exports = {aristotlek12};