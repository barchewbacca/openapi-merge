import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const urls = core.getInput('urls', { required: true });

    const urlList = JSON.parse(urls);

    // eslint-disable-next-line no-console
    console.log('Test', urlList, token);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
