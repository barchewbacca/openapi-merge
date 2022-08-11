import * as core from '@actions/core';
import axios from 'axios';
import fs from 'fs';
import * as yaml from 'js-yaml';
import { AppList } from './interfaces';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const filename = core.getInput('filename', { required: true });
    const path = core.getInput('path', { required: false });

    const appList: AppList = JSON.parse(fs.readFileSync(`${path}/${filename}`, 'utf-8'));

    for (const [appId, appItem] of Object.entries(appList)) {
      const { openApi, asyncApi, guides } = appItem;

      if (openApi) {
        const openApiOutput = await Promise.all(
          openApi.map(async url => {
            const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
            const rawUrl = `https://raw.githubusercontent.com/${cleanUrl}`;

            const { data } = await axios.get(rawUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            });
            return {
              output: yaml.load(data),
              appId,
            };
          })
        );
        const jsonData = JSON.stringify(openApiOutput, null, 2);
        if (fs.existsSync(`${path}/${appId}`) === false) {
          fs.mkdirSync(`${path}/${appId}`);
        }
        fs.writeFileSync(`${path}/${appId}/openApi.json`, jsonData);
      }

      if (asyncApi) {
        const asyncApiOutput = await Promise.all(
          asyncApi.map(async url => {
            const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
            const rawUrl = `https://raw.githubusercontent.com/${cleanUrl}`;

            const { data } = await axios.get(rawUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
            });
            return {
              output: yaml.load(data),
              appId,
            };
          })
        );
        const jsonData = JSON.stringify(asyncApiOutput, null, 2);
        if (fs.existsSync(`${path}/${appId}`) === false) {
          fs.mkdirSync(`${path}/${appId}`);
        }
        fs.writeFileSync(`${path}/${appId}/asyncApi.json`, jsonData);
      }
      if (guides) {
        await Promise.all(
          guides.map(async ({ topic, url }) => {
            const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
            const rawUrl = `https://raw.githubusercontent.com/${cleanUrl}`;

            const { data } = await axios.get(rawUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'text/markdown',
                Accept: '*/*',
              },
            });

            if (fs.existsSync(`${path}/${appId}/guides`) === false) {
              fs.mkdirSync(`${path}/${appId}/guides`);
            }
            fs.writeFileSync(`${path}/${appId}/guides/${topic}.md`, data);
          })
        );
      }
    }
  } catch (error) {
    console.log('error', error);
    core.setFailed(error);
  }
}

run();
