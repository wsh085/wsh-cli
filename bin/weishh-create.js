#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const path = require("path");
const home = require("user-home");
const exists = require("fs").existsSync;
const inquirer = require("inquirer");
const ora = require("ora");
const fs = require("fs-extra");
const gitClone = require("git-clone/promise");

const checkVersion = require("../lib/check-version");
const generate = require("../lib/generate");
const ask = require("../lib/ask");

program.usage("[project-name]").parse(process.argv);

// 创建项目的目录名
// program.args[0] 取的是命令行的第一个参数
const rawName = program.args[0];
// true则表示没写或者'.'，即在当前目录下构建
const inPlace = !rawName || rawName === ".";
// 如果是在当前目录下构建，则创建项目名为当前目录名；如果不是，创建项目名则为 rawName
// process.cwd() = /Users/weishh/learn/cli-demo
const projectName = inPlace ? path.relative("../", process.cwd()) : rawName;
// 创建项目目录的绝对路径
const projectPath = path.resolve(projectName || ".");
// 远程模板下载到本地的路径
// downloadPath = /Users/weishh/project-template
const downloadPath = path.join(home, "project-template");

/**
  rawName =  test
  inPlace =  false
  projectName =  test
  projectPath =  /Users/wsh/wsh-github/weishh-cli/test
  downloadPath =  /Users/wsh/project-template
 */

const spinner = ora();

process.on("exit", () => {
  console.log();
});

// 在当前目录下创建或者创建的目录名已经存在，则进行询问，否则直接执行 run 函数
if (inPlace || exists(projectPath)) {
  inquirer
    .prompt([
      {
        type: "confirm",
        message: inPlace
          ? "Generate project in current directory?"
          : "Target directory exists. Do you want to replace it?",
        name: "ok",
      },
    ])
    .then((answers) => {
      if (answers.ok) {
        console.log(chalk.yellow("Deleting old project ..."));
        if (exists(projectPath)) fs.removeSync(projectPath);
        run();
      }
    })
    .catch((err) => console.log(chalk.red(err.message.trim())));
} else {
  run();
}

function run() {
  // 先收集用户的输入，再下载模板
  ask().then((answers) => {
    if (exists(downloadPath)) fs.removeSync(downloadPath);
    checkVersion(() => {
      // 模板的 github 地址为 https://github.com/wsh085/react-project-template
      const templateURL = "https://github.com/wsh085/react-project-template";
      downloadAndGenerate(templateURL, answers);
    });
  });
}

function downloadAndGenerate(templateGitUrl, answers) {
  spinner.start("Downloading template ...");
  return new Promise(async (resolve, reject) => {
    try {
      await gitClone(templateGitUrl, `${downloadPath}/${answers.name}`, {
        checkout: "master",
        shallow: true,
      });
      spinner.succeed("Successful download template!");
      generate(projectName, downloadPath, projectPath, answers);
    } catch (error) {
      spinner.fail(
        "Failed to download repo " + templateGitUrl + ": " + err.message.trim()
      );
    }
  });
}
