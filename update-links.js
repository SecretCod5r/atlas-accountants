const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /href="\/services-construction"/g, to: 'href="/services/construction-bookkeeping"' },
    { from: /href="\/services-real-estate"/g, to: 'href="/services/real-estate-investors"' },
    { from: /href="\/services-retail-sales-tax"/g, to: 'href="/services/retail-sales-tax"' },
    { from: /href="\/services-small-business"/g, to: 'href="/services/small-business"' },
    { from: /href="\/services-payroll"/g, to: 'href="/services/payroll"' },
    { from: /href="\/services-law-firm"/g, to: 'href="/services/law-firms"' },
    { from: /href="\/services-cfo-advisory"/g, to: 'href="/services/cfo-advisory"' }
];

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (f === 'node_modules' || f === '.git' || f.startsWith('.')) return;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(__dirname, function(filePath) {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;
        
        replacements.forEach(r => {
            content = content.replace(r.from, r.to);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Updated links in: ' + filePath);
        }
    }
});
