const fs = require('fs');
const path = require('path');
const logger = require('winston');
const Constants = require('./../constants');
const packageInfo = require('../../package.json');

//const PREFIX = 'http://hotsapi.net/api/v1';
const PREFIX = 'https://api.heroesprofile.com/api';

const UPLOAD_ENDPOINT = '/upload/heroesprofile/electron';
const USER_AGENT = `HeroesProfile Electron Uploader / version ${packageInfo.version} (https://github.com/Heroes-Profile/heroesprofile-electron-uploader)`;

class API {
	/**
	 * Uploads replay to heroesprofile.com and returns promise with replay object with new status
	 *
	 * @param {Object} replay
	 * @returns {Promise<Object>}
	 */
	static async uploadReplay(replay) {
		logger.info(`Uploading: ${replay.fullPath}`);

		try {
			const fileBuffer = await fs.promises.readFile(replay.fullPath);
			const blob = new Blob([fileBuffer]);
			const formData = new FormData();
			formData.append('file', blob, path.basename(replay.fullPath));
			formData.append('version', packageInfo.version);

			const resp = await fetch(`${PREFIX}${UPLOAD_ENDPOINT}`, {
				method: 'POST',
				headers: { 'User-Agent': USER_AGENT },
				body: formData
			});

			if (!resp.ok) {
				logger.error(`Upload failed with HTTP ${resp.status}: ${replay.fullPath}`);
				return Object.assign({}, replay, {
					status: Constants.REPLAY_STATUS.UPLOAD_ERROR
				});
			}

			const body = await resp.text();

			try {
				const parsedBody = JSON.parse(body);
				logger.info(`Uploaded: ${replay.fullPath} - body: ${body}`);
				return Object.assign({}, replay, {
					status:
						Constants.REPLAY_STATUS[parsedBody.status] ||
						Constants.REPLAY_STATUS.UNKNOWN
				});
			} catch (err) {
				// If for some reason we failed to parse response from API
				logger.error(`Failed to parse response: ${replay.fullPath} - ${err.stack || err}`);
				return Object.assign({}, replay, {
					status: Constants.REPLAY_STATUS.UNKNOWN
				});
			}
		} catch (err) {
			logger.error(`Failed to upload: ${replay.fullPath} - ${err.stack || err}`);
			return Object.assign({}, replay, {
				status: Constants.REPLAY_STATUS.UPLOAD_ERROR
			});
		}
	}
}

module.exports = API;
