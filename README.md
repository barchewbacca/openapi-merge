<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

## Description

A github action that merge multiple openapi links from different repositories into an array of object as JSON

## Usage

```yml
      - uses: actions/checkout@v2

      - name: Merge OpenAPIs into one
        uses: barchewbacca/openapi-merge@main
        with:
          token: ${{ TOKEN }}
          path: 'path/to/openapi/merge/file'
```

### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` (`repo` and `workflow` should be scoped) [Personal Access Token (PAT)](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). |  |
| `path` | Path to the `openapi-merge.json` file that contain list of the openapi links of different repositories. | root `.` |

**Note**: The token must have access to the all listed repositories in the input array of the `openapi-merge.json` if they are private with a minimum read permission.

**Note**: The sso is need to be enabled if an organization or as account require that.
