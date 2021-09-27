import * as core from '@actions/core';
import axios from 'axios';
import fs from 'fs';
import * as yaml from 'js-yaml';
import { Configuration } from './interfaces';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const path = core.getInput('path', { required: false });

    const config: Configuration = JSON.parse(fs.readFileSync(`${path}/openapi-merge.json`, 'utf-8'));

    // array of yaml
    const yamlData = await Promise.all(
      config.inputs.map(async ({ inputFile }) => {
        const cleanUrl = inputFile.replace('https://github.com/', '').replace('blob/', '');
        const rawUrl = `https://raw.githubusercontent.com/${cleanUrl}`;

        const { data } = await axios.get(rawUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        });

        return yaml.load(data);
      })
    );
    const jsonData = JSON.stringify(yamlData);
    fs.writeFileSync(path + config.output, jsonData);
  } catch (error) {
    console.log('error', error);
    core.setFailed(error);
  }
}

run();
