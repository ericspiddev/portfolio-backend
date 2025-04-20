// Octokit.js
// https://github.com/octokit/core.js#readme
import { Octokit } from "@octokit/core";
import fs from "fs";
import {vuart_feature, vga_feature} from "./port-pull-data.js"
import {scheduleJob} from "node-schedule" // use to grab data from API
import {dataPath} from "../index.js";

let first = 0;

class Commit {
   constructor(sha, message, author) {
        this.sha = sha;
        this.message = message;
        this.author = author;
    }
};

function writeFeatureCommits(path, features)
{
    //console.log("Writing to file with data... " + JSON.stringify(commits));

    // attempt to write the data to the file
    try {
        fs.writeFileSync(path, JSON.stringify(features));
    } catch(err) {
        console.error("Could not write to path " + path + " with error " + error);
    }

}

async function requestAllFeatureData() {
    let features = {};
    features["pl011_vuart_feature"] = await getFeatureCommits(vuart_feature);
    features["x86_vga_feature"] = await getFeatureCommits(vga_feature);
    return features;
}

export function readFeatureCommitData(path)
{
    return readCommitData(path);
}

async function readCommitData(path)
{
    if (!first) {
        // make a request
        let features = await requestAllFeatureData();
        writeFeatureCommits(dataPath, features);
        first = 1;
    }

    if (fs.existsSync(path)) {
        console.log("found the file at the path " + path);
        const commits = fs.readFileSync(path, 'utf-8');
        return JSON.parse(commits)

    } else {
        // we need to request the data here
        console.log("Cannot find file at path " + path + " requesting fresh data");
        requestAllFeatureData();
    }
}

export function setupPrApiRequests(scheduleString) {
    first = 0; // reset first just in case
    console.log("Set up a schedule for requesting data to see if it changes");
    const job = scheduleJob(scheduleString, async function () {
        console.log("Refreshing data from Github....");
        try {
            let features = await requestAllFeatureData();
            if (features != undefined) {
                writeFeatureCommits(dataPath, features);
            }
        } catch(err) {
            console.error("Scheduled job had a problem: " + error);
        }
    });
}

async function getFeatureCommits(pullRequestData) { // array of data for PRs
    let projectCommits = {};
    let err = 0;
    for(let i = 0; i < pullRequestData.length; i++) {
        let data = pullRequestData[i];
        projectCommits[data.repo] = {};
        try {
            let prData = await getProjectPullRequests(data.project, data.repo, data.pullRequestId);
            projectCommits[data.repo] = prData;
        } catch (err) {
            err = -1
            console.log("Error processing the pr data")
        }
    }

    if (err != -1) {
        console.log("Succesfully got data... writing to the file!");
        console.log("Data returned is " + JSON.stringify(projectCommits, null, 4));
    }

    return projectCommits;
}
// we need a function that groups all of a feature's projects and calls this repeatedly
async function getProjectPullRequests(baseProject, repo, pullRequestId) { // this returns one repo's commits
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
    let rate = await octokit.request('GET /rate_limit');
    console.log(rate.data.rate.remaining);

    return parseGithubCommits(commits.data); // returns an array of commit objects that contain 'sha, message, author'
}

function parseGithubCommits(apiData)
{
    let commits = []
    apiData.forEach(commit => {
        commits.push(new Commit(commit.sha, commit.commit.message.split('\n')[0], commit.author.login));
    });
    return commits;
}
