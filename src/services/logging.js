const winston = require('winston');
const path = require('path');
const { getUserDataPath } = require('./paths');

const RE_STACK_REPLACE = /(^[^\(]+?[\n$]|^\s+at\s+)/gm;

const userData = getUserDataPath();

function getTimestamp() {
	const date = new Date();
	return (
		('0' + date.getHours()).slice(-2) +
		':' +
		('0' + date.getMinutes()).slice(-2) +
		':' +
		('0' + date.getSeconds()).slice(-2) +
		'.' +
		('00' + date.getMilliseconds()).slice(-3) +
		' ' +
		('0' + date.getDate()).slice(-2) +
		'/' +
		('0' + (date.getMonth() + 1)).slice(-2) +
		'/' +
		date.getFullYear()
	);
}

function getLastStack() {
	const e = new Error('dummy');
	return (
		e.stack.replace(RE_STACK_REPLACE, '').split('\n').splice(10, 1)[0] ||
		'Application'
	);
}

module.exports = function Logger(level) {
	const customFormat = winston.format.printf((info) => {
		const { level, message, stack, ...rest } = info;
		const metaStr = stack
			? ' - ' + stack
			: Object.keys(rest).length
				? ' - ' + JSON.stringify(rest)
				: '';
		return (
			(level.toUpperCase() + '  ').slice(0, 5) +
			': ' +
			getTimestamp() +
			' - ' +
			getLastStack() +
			' - ' +
			message +
			metaStr
		);
	});

	winston.configure({
		level: level,
		format: winston.format.combine(
			winston.format.errors({ stack: true }),
			customFormat
		),
		transports: [
			new winston.transports.File({
				filename: path.join(userData, 'application.log')
			})
		]
	});

	return winston;
};
