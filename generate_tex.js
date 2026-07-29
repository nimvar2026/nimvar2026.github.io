const fs = require('fs');

let fileContent;
try {
    fileContent = fs.readFileSync('script.js', 'utf8');
} catch (err) {
    console.error("Errore: Impossibile trovare o leggere il file 'script.js' nella cartella corrente.");
    process.exit(1);
}

function extractTalksData(code) {
    const varIdx = code.indexOf('talksData');
    if (varIdx === -1) return null;

    const startBracket = code.indexOf('[', varIdx);
    if (startBracket === -1) return null;

    let depth = 0;
    let inString = false;
    let stringChar = '';
    let endBracket = -1;

    for (let i = startBracket; i < code.length; i++) {
        const char = code[i];
        const prevChar = i > 0 ? code[i - 1] : '';

        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
        }

        if (!inString) {
            if (char === '[') depth++;
            else if (char === ']') {
                depth--;
                if (depth === 0) {
                    endBracket = i;
                    break;
                }
            }
        }
    }

    if (endBracket !== -1) {
        return code.substring(startBracket, endBracket + 1);
    }
    return null;
}

const arrayString = extractTalksData(fileContent);

if (!arrayString) {
    console.error("Errore: impossibile trovare la variabile 'talksData' in script.js");
    process.exit(1);
}

let talksData;
try {
    talksData = eval(arrayString);
} catch (e) {
    console.error("Errore di sintassi nell'array estratto:", e);
    process.exit(1);
}

function cleanLatex(text) {
    if (!text) return '';
    if (text.trim() === 'TBA') return '\\textit{To be announced}';

    const parts = text.split('$');
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            parts[i] = parts[i]
                .replace(/&/g, '\\&')
                .replace(/%/g, '\\%')
                .replace(/#/g, '\\#')
                .replace(/_/g, '\\_');
        }
    }
    return parts.join('$');
}

let texContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}

\\definecolor{navyblue}{RGB}{10, 37, 64}

\\hypersetup{
    colorlinks=true,
    linkcolor=navyblue,
    urlcolor=navyblue
}

\\begin{document}

\\begin{center}
    {\\LARGE\\bfseries Nonlocality in image denoising and other variational problems}\\\\[1.2em]
    {\\large Department of Mathematics, University of Pavia}\\\\[0.4em]
    {\\normalsize September 14 -- 17, 2026}\\\\[1.8em]
    {\\Large\\bfseries Book of Abstracts}
\\end{center}

\\vspace{0.8cm}
\\tableofcontents
\\newpage
`;

const invitedTalks = talksData.filter(t => t.type === 'invited');
const contributedTalks = talksData.filter(t => t.type === 'contributed');

texContent += `\\section{Invited Talks}\n\\vspace{0.5cm}\n`;
invitedTalks.forEach(talk => {
    texContent += `
\\subsection*{${cleanLatex(talk.title)}}
\\addcontentsline{toc}{subsection}{${cleanLatex(talk.speaker)} (${cleanLatex(talk.affiliation)})}
\\textbf{Speaker:} ${cleanLatex(talk.speaker)} (${cleanLatex(talk.affiliation)})\\\\[0.5em]
\\textbf{Abstract:} ${cleanLatex(talk.abstract)}

\\vspace{1em}
\\dotfill
\\vspace{1.5em}
`;
});

texContent += `\\newpage\n\\section{Contributed Talks}\n\\vspace{0.5cm}\n`;
contributedTalks.forEach(talk => {
    texContent += `
\\subsection*{${cleanLatex(talk.title)}}
\\addcontentsline{toc}{subsection}{${cleanLatex(talk.speaker)} (${cleanLatex(talk.affiliation)})}
\\textbf{Speaker:} ${cleanLatex(talk.speaker)} (${cleanLatex(talk.affiliation)})\\\\[0.5em]
\\textbf{Abstract:} ${cleanLatex(talk.abstract)}

\\vspace{1em}
\\dotfill
\\vspace{1.5em}
`;
});

texContent += `\\end{document}`;

fs.writeFileSync('book_of_abstracts.tex', texContent);
console.log('SUCCESS: File book_of_abstracts.tex generato con successo!');