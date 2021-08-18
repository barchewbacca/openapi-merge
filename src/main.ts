import * as core from '@actions/core';
import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';
import { Configuration } from './interfaces';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const path = core.getInput('path', { required: false });

    const config: Configuration = JSON.parse(fs.readFileSync(`${path}/openapi-merge.json`, 'utf-8'));

    const urls = config.inputs.map(({ inputFile }) => inputFile);

    for (const [index, url] of urls.entries()) {
      const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
      const rawUrl = `https://raw.githubusercontent.com/${cleanUrl}`;

      const { data } = await axios.get(rawUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      fs.writeFileSync(`${path}/openapi-${index}.yaml`, data);

      config.inputs[index].inputFile = `openapi-${index}.yaml`;
    }

    fs.writeFileSync(`${path}/openapi-merge.json`, JSON.stringify(config, null, 2));

    execSync(`npx openapi-merge-cli --config ${path}/openapi-merge.json`);

    execSync('git clean -f');

    execSync(`git restore ${path}/openapi-merge.json`);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
