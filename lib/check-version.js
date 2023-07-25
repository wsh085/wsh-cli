const request = require("request");
const semver = require("semver");
const chalk = require("chalk");
const packageConfig = require("../package.json");

module.exports = (done) => {
  // semver.satisfies 判断版本是否在某个范围
  if (!semver.satisfies(process.version, packageConfig.engines.node)) {
    return console.log(
      chalk.red(
        `  You must upgrade node to >= ${packageConfig.engines.node} .x to use weishh-cli`
      )
    );
  }

  // 检查对比本地安装的版本 与 线上最新的版本 哪个更新
  request(
    {
      url: "https://registry.npmjs.org/weishh-cli",
      timeout: 1000,
    },
    (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const latestVersion = JSON.parse(body)["dist-tags"].latest;
        const localVersion = packageConfig.version;
        // semver.lt 第一个参数的版本小于第二个参数的版本
        if (semver.lt(localVersion, latestVersion)) {
          console.log();
          console.log(
            chalk.yellow("  A newer version of weishh-cli is available.")
          );
          console.log();
          console.log(`  latest:     ${chalk.green(latestVersion)}`);
          console.log(`  installed:  ${chalk.red(localVersion)}`);
          console.log();
        }
      }
      done();
    }
  );
};
