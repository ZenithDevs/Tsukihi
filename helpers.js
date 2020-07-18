//@ts-nocheck
const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);
const unlink = util.promisify(fs.unlink);
const rmdir = util.promisify(fs.rmdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const rename = util.promisify(fs.rename);

function getPackageFolder(package) {
	const unpacked = path.resolve(__dirname, '../.yarn/unplugged');
	const items = fs.readdirSync(unpacked);
	return path.resolve(
		path.resolve(
			unpacked,
			items.find((item) => item.split('-npm')[0] == package)
		),
		`node_modules/${package}`
	);
}

const removeDir = async (dir) => {
	try {
		const files = await readdir(dir);
		await Promise.all(
			files.map(async (file) => {
				try {
					const p = path.join(dir, file);
					const stat = await lstat(p);
					if (stat.isDirectory()) {
						await removeDir(p);
					} else {
						await unlink(p);
					}
				} catch (err) {
					console.error(err);
				}
			})
		);
		await rmdir(dir);
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	rmrf: removeDir,
	readdir,
	writeFile,
	readFile,
	rename,
	getPackageFolder,
};
