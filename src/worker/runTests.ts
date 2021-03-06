import Jasmine = require('jasmine');
import * as RegExEscape from 'escape-string-regexp';
import { RunTestsReporter } from './runTestsReporter';
import { copyOwnProperties } from '../util';

const sendMessage = process.send ? (message: any) => process.send!(message) : () => {};

let logEnabled = false;
try {

	let testsToRun: string[] | undefined;

	const argv = process.argv;
	const configFile = argv[2];
	logEnabled = <boolean>JSON.parse(argv[3]);

	if (argv.length > 4) {
		testsToRun = JSON.parse(argv[4]);
	}

	const regExp = testsToRun ? testsToRun.map(RegExEscape).join('|') : undefined;
	const jasmine = new Jasmine({ baseProjectPath: process.cwd });
	if (logEnabled) sendMessage('Loading config file');
	jasmine.loadConfigFile(configFile);

	if (logEnabled) sendMessage('Executing Jasmine');
	jasmine.execute(undefined, regExp);

	// The reporter must be added after the call to jasmine.execute() because otherwise
	// it would be removed if the user changes the reporter in the helper files. 
	// Note that jasmine will start the tests asynchronously, so the reporter will still
	// be added before the tests are run.
	if (logEnabled) sendMessage('Creating and adding reporter');
	jasmine.env.addReporter(new RunTestsReporter(sendMessage, testsToRun));

} catch (err) {
	if (logEnabled) sendMessage(`Caught error ${JSON.stringify(copyOwnProperties(err))}`);
	throw err;
}
