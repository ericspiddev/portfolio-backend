// Octokit.js
// https://github.com/octokit/core.js#readme
import { Octokit } from "@octokit/core";


export function getPullRequest(baseProject, repo, pullRequestId) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_API_TOKEN
    });
    const commits = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
      owner: baseProject,
      repo: repo,
      pull_number: pullRequestId,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    const commitData = commits.data;
    console.log(commitData);
}



