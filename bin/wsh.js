#!/usr/bin/env node

const program = require("commander");

program
  .version(require("../package").version)
  .usage("<command> [options]")
  // 自定义 create 命令，接收一个必填参数 project，[other...] 表示其他参数
  .command("create", "用模板创建一个新的项目")
  .parse(process.argv);
