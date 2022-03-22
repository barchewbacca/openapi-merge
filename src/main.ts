import * as core from '@actions/core';
import axios from 'axios';
import fs from 'fs';
import * as yaml from 'js-yaml';
import { Configuration, OutputApp } from './interfaces';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const path = core.getInput('path', { required: false });

    const config: Configuration = JSON.parse(fs.readFileSync(`${path}/openapi-merge.json`, 'utf-8'));

    const outputAppList: OutputApp[] = await Promise.all(
      config.appList.map(async ({ url, appId }) => {
        const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
        const rawUrl = `https://raw.githubusercontent.com/${cleanUrl}`;

        const { data } = await axios.get(rawUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        });

        // convert YAML to plain object
        // add appId if it's there
        return {
          openApi: yaml.load(data),
          ...(appId && { appId }),
        };
      })
    );
    const jsonData = JSON.stringify(outputAppList, null, 2);
    fs.writeFileSync(path + config.output, jsonData);
  } catch (error) {
    console.log('error', error);
    core.setFailed(error);
  }
}

run();
