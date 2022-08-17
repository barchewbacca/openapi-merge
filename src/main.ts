import * as core from '@actions/core';
import axios from 'axios';
import fs from 'fs';
import * as yaml from 'js-yaml';
import { ApiOutput, AppList } from './interfaces';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const filename = core.getInput('filename', { required: true });
    const path = core.getInput('path', { required: false });

    const appList: AppList = JSON.parse(fs.readFileSync(`${path}/${filename}`, 'utf-8'));

    for (const [appId, appItem] of Object.entries(appList)) {
      const { openApi, asyncApi, guides } = appItem;

      if (openApi) {
        const openApiOutput = await fetchApiList(openApi, token, appId);
        updateOutputSpecFiles(openApiOutput, path, appId, 'openApi');
      }

      if (asyncApi) {
        const asyncApiOutput = await fetchApiList(asyncApi, token, appId);
        updateOutputSpecFiles(asyncApiOutput, path, appId, 'asyncApi');
      }

      if (guides) {
        await Promise.all(
          guides.map(async ({ topic, url }) => {
            const githubUrl = getGithubUrl(url);
            const data = await getData(githubUrl, token, 'text/markdown');
            const relativePath = `${path}/${appId}/guides`;
            if (fs.existsSync(relativePath) === false) {
              fs.mkdirSync(relativePath, { recursive: true });
            }
            fs.writeFileSync(`${relativePath}/${topic}.md`, data);
          })
        );
      }
    }
  } catch (error) {
    console.log('error', error);
    core.setFailed(error as string);
  }
}

async function fetchApiList(urlList: string[], token: string, appId: string): Promise<ApiOutput[]> {
  const apiOutput = Promise.all(
    urlList.map(async url => {
      const githubUrl = getGithubUrl(url);
      const data = await getData(githubUrl, token, 'application/json');
      return {
        output: yaml.load(data),
        appId,
      };
    })
  );
  return apiOutput;
}

async function getData(url: string, token: string, contentType: string): Promise<string> {
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
      Accept: '*/*',
    },
  });
  return data;
}

function updateOutputSpecFiles(openApiOutput: ApiOutput[], path: string, appId: string, filename: string): void {
  const jsonData = JSON.stringify(openApiOutput, null, 2);
  const relativePath = `${path}/${appId}`;
  if (fs.existsSync(relativePath) === false) {
    fs.mkdirSync(relativePath, { recursive: true });
  }
  fs.writeFileSync(`${relativePath}/${filename}.json`, jsonData);
}

function getGithubUrl(url: string): string {
  const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
  return `https://raw.githubusercontent.com/${cleanUrl}`;
}

run();
