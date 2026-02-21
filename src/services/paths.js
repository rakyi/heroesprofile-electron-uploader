const path = require('path');
const os = require('os');
const packageInfo = require('../../package.json');

function getUserDataPath() {
	const appName = packageInfo.productName;
	switch (process.platform) {
		case 'darwin':
			return path.join(os.homedir(), 'Library', 'Application Support', appName);
		case 'win32':
			return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), appName);
		default:
			return path.join(os.homedir(), '.config', appName);
	}
}

module.exports = { getUserDataPath };
