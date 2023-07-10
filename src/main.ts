import * as core from '@actions/core';
import fs from 'fs';
import * as yaml from 'js-yaml';
import { DeveloperConfig, FetchApiResponse, FetchGuideResponse, GuideConfig } from './interfaces';
import { fetchDataFromGitHub } from './utils';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const filename = core.getInput('filename', { required: true });
    const path = core.getInput('path', { required: false });

    const developerConfig: DeveloperConfig = JSON.parse(fs.readFileSync(`${path}/${filename}`, 'utf-8'));
    core.info(developerConfig.toString());

    for (const [appId, configItem] of Object.entries(developerConfig)) {
      const { openapiUrls, asyncapiUrls, guides } = configItem;

      if (openapiUrls && openapiUrls.length) {
        const fetchResponse = await fetchApiSpecsAndSaveSourceFile(openapiUrls, token, appId, path, 'openapi');
        saveApiSpecs(fetchResponse, path, 'openapi.json');
      }

      if (asyncapiUrls && asyncapiUrls.length) {
        const fetchResponse = await fetchApiSpecsAndSaveSourceFile(asyncapiUrls, token, appId, path, 'asyncapi');
        saveApiSpecs(fetchResponse, path, 'asyncapi.json');
      }

      if (guides && guides.length) {
        const fetchResponse = await fetchGuides(guides, token, appId);
        saveGuides(fetchResponse, path);
      }
    }
  } catch (error) {
    console.log('error', error);
    core.setFailed(error as string);
  }
}

function saveFile(data: string, path: string, filename: string): void {
  const dirExists = fs.existsSync(path);

  if (!dirExists) {
    fs.mkdirSync(path, { recursive: true });
  }

  fs.writeFileSync(`${path}/${filename}`, data);
}

async function fetchApiSpecsAndSaveSourceFile(
  urls: string[],
  token: string,
  appId: string,
  path: string,
  filename: string
): Promise<FetchApiResponse[]> {
  return Promise.all(
    urls.map(async (url, index) => {
      const data = await fetchDataFromGitHub(url, token, 'application/json');

      // saving the source file as a side effect
      const srcPath = `${path}/${appId}`;
      const srcFilename = `${filename}-${(index + 1).toString().padStart(2, '0')}.yaml`;
      saveFile(data, srcPath, srcFilename);

      // returning the result response object
      return {
        data: yaml.load(data),
        appId,
      };
    })
  );
}

function saveApiSpecs(fetchResponse: FetchApiResponse[], path: string, filename: string): void {
  const jsonData = JSON.stringify(fetchResponse, null, 2);
  const relativePath = `${path}/${fetchResponse[0].appId}`;
  saveFile(jsonData, relativePath, filename);
}

async function fetchGuides(guides: GuideConfig[], token: string, appId: string): Promise<FetchGuideResponse[]> {
  return Promise.all(
    guides.map(async ({ name, url }) => {
      const data = await fetchDataFromGitHub(url, token, 'text/markdown');

      return {
        data,
        appId,
        name,
      };
    })
  );
}

function saveGuides(fetchResponse: FetchGuideResponse[], path: string): void {
  for (const { appId, data, name } of fetchResponse) {
    const relativePath = `${path}/${appId}/guides`;
    saveFile(data, relativePath, `${name}.md`);
  }
}

run();
