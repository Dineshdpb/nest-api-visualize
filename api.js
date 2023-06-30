const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getAPIInformation(nestJSProjectPath) {
  const command = `npx nest routes ${nestJSProjectPath}`;

  try {
    const { stdout } = await exec(command);
    const apiInformation = JSON.parse(stdout);

    return apiInformation;
  } catch (error) {
    console.error('Failed to retrieve API information:', error);
    return null;
  }
}
