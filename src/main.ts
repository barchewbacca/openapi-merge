import * as core from '@actions/core';
import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';
import { Configuration } from './interfaces';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const inputPath = core.getInput('inputPath', { required: true });

    const config: Configuration = JSON.parse(fs.readFileSync(`${inputPath ?? '.'}/openapi-merge.json`, 'utf-8'));

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

      fs.writeFileSync(`${inputPath ?? '.'}/openapi-${index}.yaml`, data);

      config.inputs[index].inputFile = `openapi-${index}.yaml`;
    }

    fs.writeFileSync(`${inputPath ?? '.'}/openapi-merge.json`, JSON.stringify(config, null, 2));

    execSync(`npx openapi-merge-cli --config ${inputPath ?? '.'}/openapi-merge.json`);

    execSync('git clean -f');

    execSync(`git restore ${inputPath ?? '.'}/openapi-merge.json`);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
