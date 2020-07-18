/*
 Tsukihi: Zenith internal SSG.
 (c) 2020 Zenith, the Eclipse developers, and the Parcility developers.
 */

const fs = require('fs-extra');
const path = require('path');
const pug = require('pug');
const { rmrf, readdir, writeFile } = require('./helpers');

const SITE_INPUT_PATH = 'site';
const SITE_OUTPUT_PATH = 'docs';

const CNAME = "zenithdevs.com"

async function main() {
	try {
		await rmrf(path.resolve(__dirname, SITE_OUTPUT_PATH));
		await fs.mkdir(path.resolve(__dirname, SITE_OUTPUT_PATH));
		const dir = await readdir(path.resolve(__dirname, SITE_INPUT_PATH));

		// Write CNAME
		writeFile(
			path.join(__dirname, SITE_OUTPUT_PATH, "CNAME"),
			CNAME
		)

		// Output pug files as html
		await Promise.all(
			dir
				.filter((file) => file.split('.').pop() === 'pug')
				.map((res) => [
					res.replace('.pug', '.html'),
					pug.renderFile(
						path.resolve(__dirname, SITE_INPUT_PATH, res),
						{
							"projects": JSON.parse(fs.readFileSync(path.resolve(__dirname, SITE_INPUT_PATH + "/data/projects.json"), 'utf8'))
						}
					),
				])
				.map(([name, html]) =>
					writeFile(
						path.join(__dirname, SITE_OUTPUT_PATH, name),
						html
					)
				)
		);

		// Copy assets folder
		await fs.copy(
			path.resolve(__dirname, SITE_INPUT_PATH, 'assets'),
			path.resolve(__dirname, SITE_OUTPUT_PATH, 'assets')
		);
		console.log(
			`Successfully built & outputted the website at \x1b[36mdocs/\x1b[0m.`
		);

		// console.log(`Successfully renamed & moved the directory to \x1b[36mdocs/${dir}\x1b[0m.`);
	} catch (error) {
		console.error('An error occurred while building the site:', error);
	}
}

main();
