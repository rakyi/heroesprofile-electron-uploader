const fs = require('fs');
const path = require('path');
const logger = require('winston');
const { getUserDataPath } = require('./paths');

const STORAGE_VERSION = 1;
const STORAGE_FILE = 'upload-data.json';

const STORAGE_FILE_PATH = path.join(getUserDataPath(), STORAGE_FILE);

class Storage {
	static async getLocalDatabase() {
		try {
			await fs.promises.access(STORAGE_FILE_PATH);
		} catch {
			logger.info("Storage doesn't exist. Creating now...");
			return await Storage.saveLocalDatabase({});
		}

		try {
			const storageData = JSON.parse(await fs.promises.readFile(STORAGE_FILE_PATH, 'utf-8'));

			// TODO implement migration
			if (storageData.version !== STORAGE_VERSION) {
				logger.info("Storage doesn't match app's version. Creating new...");
				return await Storage.saveLocalDatabase({});
			}
			return storageData;
		} catch (err) {
			logger.error(`Error reading storage: ${err.message}`);
			return await Storage.saveLocalDatabase({});
		}
	}

	static async saveLocalDatabase(replays) {
		logger.info('Saving data to the storage...');
		const data = { replays, version: STORAGE_VERSION };
		await fs.promises.mkdir(path.dirname(STORAGE_FILE_PATH), { recursive: true });
		await fs.promises.writeFile(STORAGE_FILE_PATH, JSON.stringify(data));
		return data;
	}
}

module.exports = Storage;
