import axios from 'axios';

function mapGitHubBlobUrlToDownloadUrl(url: string): string {
  const cleanUrl = url.replace('https://github.com/', '').replace('blob/', '');
  return `https://raw.githubusercontent.com/${cleanUrl}`;
}

export async function fetchDataFromGitHub(blobUrl: string, token: string, contentType: string): Promise<string> {
  const downloadUrl = mapGitHubBlobUrlToDownloadUrl(blobUrl);
  const { data } = await axios.get(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
      Accept: '*/*',
    },
  });
  return data;
}
