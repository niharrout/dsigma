const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");

async function run() {
    const USER_NAME = core.getInput("USER_NAME");
    const P_W = core.getInput("P_W");
  const body = {
    username: USER_NAME,
    password: P_W,
  };
  const TokenFetchResponse = await fetch(
    "http://40.122.209.231/api/v1/users/login-user",
    {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
  const Tokendata = await TokenFetchResponse.json();
  const Token = Tokendata.token;

  const response = await fetch(
    "http://40.122.209.231/api/v1/4dalert/database-data-change-monitor?database=decisionsigma",
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        cookie: `4dalert-user-token=${Token}`,
      },
    }
  );
  const ResonseData = await response.text();
  console.log("ResonseData : ", ResonseData);

  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const { context = {} } = github;
  const { pull_request } = context.payload;

  await octokit.rest.issues.createComment({
    ...context.owner,
    ...context.repo,
    issue_number: pull_request.number,
    body: `Thank you for submitting a pull request! We will try to review this as soon as we can.\n\n${ResonseData}`,
  });
}

run();
