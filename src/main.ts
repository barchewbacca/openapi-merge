import * as core from '@actions/core';
import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const config = JSON.parse(fs.readFileSync('openapi-merge-src.json', 'utf-8'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urls = config.inputs.map(({ inputFile }: any) => inputFile);

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

      fs.writeFileSync(`openapi-${index}.yaml`, data);

      config.inputs[index].inputFile = `openapi-${index}.yaml`;
    }

    fs.writeFileSync('openapi-merge.json', JSON.stringify(config));

    execSync('npx openapi-merge-cli');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
