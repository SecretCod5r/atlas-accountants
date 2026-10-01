const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            if(file !== 'node_modules' && file !== '.git' && file !== '.agents' && file !== '.gemini' && file !== 'data') {
                filelist = walkSync(path.join(dir, file), filelist);
            }
        }
        else {
            if(file.endsWith('.html')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

const htmlFiles = walkSync(__dirname);
console.log("Found " + htmlFiles.length + " HTML files.");

let hasGA4 = false;
let issues = [];

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('G-98XT9JEQ0X') || content.includes('gtag.js')) {
        hasGA4 = true;
    }
    
    let gtmCount = content.split('GTM-PZHB94LG').length - 1;
    let pixelCount = content.split('2518052082018824').length - 1;
    let clarityCount = content.split('yqbbmo7ei5').length - 1;
    
    // Note: GTM has head and body part, so it appears twice (once in head, once in iframe)
    if (gtmCount !== 2) {
        issues.push("GTM issue in " + path.relative(__dirname, file) + " (count: " + gtmCount + ")");
    }
    if (pixelCount !== 2) { // init and img src
        issues.push("Pixel issue in " + path.relative(__dirname, file) + " (count: " + pixelCount + ")");
    }
    if (clarityCount !== 1) {
        issues.push("Clarity issue in " + path.relative(__dirname, file) + " (count: " + clarityCount + ")");
    }
});

if (hasGA4) {
    console.log("GA4 is already hardcoded on the site (G-98XT9JEQ0X).");
}
if (issues.length > 0) {
    console.log("Found issues:");
    console.log(issues.slice(0, 15).join("\\n"));
} else {
    console.log("All tracking codes appear exactly the correct number of times in all valid HTML files.");
}
