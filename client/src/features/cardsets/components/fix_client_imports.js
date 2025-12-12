// Исправить ВСЕ файлы в client/src
const fs = require("fs");
const path = require("path");

const projectRoot = "client/src";

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;
    
    // Замены для импортов
    content = content.replace(/from\s+['"](.*?)['"]/g, (match, importPath) => {
        // Исправить пути с cardset  cardSet
        let fixed = importPath.replace(/cardset/gi, "cardSet");
        if (fixed !== importPath) {
            console.log(`Исправлен импорт в ${filePath}: ${importPath}  ${fixed}`);
        }
        return `from '${fixed}'`;
    });
    
    // Замены для require
    content = content.replace(/require\(['"](.*?)['"]\)/g, (match, importPath) => {
        let fixed = importPath.replace(/cardset/gi, "cardSet");
        if (fixed !== importPath) {
            console.log(`Исправлен require в ${filePath}: ${importPath}  ${fixed}`);
        }
        return `require('${fixed}')`;
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, "utf8");
    }
}

// Пройти по всем файлам
function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
            fixImportsInFile(filePath);
        }
    }
}

walkDir(projectRoot);
console.log(" Импорты исправлены!");
