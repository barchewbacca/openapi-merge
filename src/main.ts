import * as core from '@actions/core';
import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const inputPath = core.getInput('inputPath', { required: true });
    // const outputPath = core.getInput('outputPath', { required: true });
    // const token = '123';
    // const inputPath = '/Users/sarea.al.kebaly/workspace/frodo/libs/shared/assets/src/assets/openapi';
    // const outputPath = '/Users/sarea.al.kebaly/workspace/frodo/libs/shared/assets/src/assets/openapi';

    const config = JSON.parse(fs.readFileSync(`${inputPath ?? '.'}/openapi-merge.json`, 'utf-8'));

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

      fs.writeFileSync(`${inputPath ?? '.'}/openapi-${index}.yaml`, data);

      config.inputs[index].inputFile = `openapi-${index}.yaml`;
    }

    fs.writeFileSync(`${inputPath ?? '.'}/openapi-merge.json`, JSON.stringify(config, null, 2));

    execSync(`npx openapi-merge-cli --config ${inputPath ?? '.'}/openapi-merge.json`);

    execSync('git clean -f');

    execSync(`git restore ${inputPath ?? '.'}/openapi-merge.json`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
