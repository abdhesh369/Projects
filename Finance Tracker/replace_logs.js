const fs = require('fs');
const path = require('path');

const loggerContent = `const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
`;

// Write logger to shared/utils
const sharedUtilsPath = path.join(__dirname, 'backend', 'shared', 'utils');
if (!fs.existsSync(sharedUtilsPath)) {
    fs.mkdirSync(sharedUtilsPath, { recursive: true });
}
const loggerPath = path.join(sharedUtilsPath, 'logger.js');
fs.writeFileSync(loggerPath, loggerContent);

console.log('Created shared logger at ' + loggerPath);

function getRelativePathToLogger(filePath) {
    const dir = path.dirname(filePath);
    let rel = path.relative(dir, loggerPath);
    // Convert backslashes to forward slashes for require()
    rel = rel.replace(/\\/g, '/');
    if (!rel.startsWith('.')) {
        rel = './' + rel;
    }
    // Remove .js extension for standard require format
    return rel.replace(/\.js$/, '');
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js') && !file.includes('node_modules') && !file.endsWith('logger.js') && !file.endsWith('replace_logs.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const allJsFiles = walk(path.join(__dirname, 'backend'));
let modifiedCount = 0;

for (const file of allJsFiles) {
    let content = fs.readFileSync(file, 'utf8');

    // Check if file uses console.log or console.error
    if (content.includes('console.log') || content.includes('console.error')) {
        const loggerRequirePath = getRelativePathToLogger(file);

        // Add require at the top of the file
        if (!content.includes("require('" + loggerRequirePath + "')")) {
            content = `const logger = require('${loggerRequirePath}');\n` + content;
        }

        // Replace console logging
        content = content.replace(/console\.log/g, 'logger.info');
        content = content.replace(/console\.error/g, 'logger.error');

        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
}

console.log(`Replaced console.log in ${modifiedCount} files.`);
