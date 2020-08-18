import electron from 'electron';
import fs from 'fs';
import path from 'path';

import {JsonDB} from 'node-json-db';

import Logger from './logger-util';

const remote =
	process.type === 'renderer' ? electron.remote : electron;

const logger = new Logger({
	file: 'linux-update-util.log',
	timestamp: true
});

/* To make the util runnable in both main and renderer process */
const {dialog, app} = remote;

let db: JsonDB;

reloadDB();

export function getUpdateItem(key: string, defaultValue: unknown = null): any {
	reloadDB();
	const value = db.getData('/')[key];
	if (value === undefined) {
		setUpdateItem(key, defaultValue);
		return defaultValue;
	}

	return value;
}

export function setUpdateItem(key: string, value: unknown): void {
	db.push(`/${key}`, value, true);
	reloadDB();
}

export function removeUpdateItem(key: string): void {
	db.delete(`/${key}`);
	reloadDB();
}

function reloadDB(): void {
	const linuxUpdateJsonPath = path.join(app.getPath('userData'), '/config/updates.json');
	try {
		const file = fs.readFileSync(linuxUpdateJsonPath, 'utf8');
		JSON.parse(file);
	} catch (error) {
		if (fs.existsSync(linuxUpdateJsonPath)) {
			fs.unlinkSync(linuxUpdateJsonPath);
			dialog.showErrorBox(
				'Error saving update notifications.',
				'We encountered an error while saving the update notifications.'
			);
			logger.error('Error while JSON parsing updates.json: ');
			logger.error(error);
		}
	}

	db = new JsonDB(linuxUpdateJsonPath, true, true);
}
