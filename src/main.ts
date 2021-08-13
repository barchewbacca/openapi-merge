import * as core from '@actions/core';
// import axios from 'axios';
// import { execSync } from 'child_process';
import fs from 'fs';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const urls = core.getInput('urls', { required: true });

    // const urlList = JSON.parse(urls);

    // const json: any = {
    //   inputs: [],
    //   output: './output.swagger.json',
    // };

    const rawdata = fs.readFileSync('migrations.json', 'utf-8');
    const migrations = JSON.parse(rawdata);
    // eslint-disable-next-line no-console
    console.log(migrations, token, urls);

    // fs.mkdirSync('openapi', { recursive: true });

    // for (const [index, url] of urlList.entries()) {
    //   const rawUrl = `https://raw.githubusercontent.com/${url.replace('https://github.com/', '').replace('blob/', '')}`;

    //   const { data } = await axios.get(rawUrl, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //       Accept: '*/*',
    //     },
    //   });

    //   fs.writeFileSync(`openapi-${index}.yaml`, data);

    //   json.inputs.push({
    //     inputFile: `openapi-${index}.yaml`,
    //   });
    // }

    // fs.writeFileSync('openapi-merge.json', JSON.stringify(json));

    // execSync('npx openapi-merge-cli');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
