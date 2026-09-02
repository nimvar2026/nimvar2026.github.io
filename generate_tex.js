const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'talks.json');
let talksData;

try {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    talksData = JSON.parse(fileContent);
} catch (err) {
    console.error("Errore: Impossibile trovare o leggere il file 'talks.json' nella cartella corrente.");
    console.error(err.message);
    process.exit(1);
}

function cleanLatex(text) {
    if (!text) return '';
    if (text.trim() === 'TBA') return '\\textit{To be announced}';

    const mathRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$[\s\S]*?(?<!\\)\$)/g;

    const parts = text.split(mathRegex);
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            parts[i] = parts[i]
                .replace(/&/g, '\\&')
                .replace(/%/g, '\\%')
                .replace(/#/g, '\\#')
                .replace(/_/g, '\\_');
        }
    }
    return parts.join('');
}

let texContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage[style=numeric,backend=biber]{biblatex}
\\definecolor{navyblue}{RGB}{10, 37, 64}
\\DeclareFieldFormat{url}{Preprint available at: \\url{#1}}
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

function generateTalkLatex(talk) {
    let output = '';
    
    const bibFile = talk.bib_file ? talk.bib_file.replace(/\\/g, '/') : null;

    if (bibFile) {
        output += `\\begin{refsection}[${bibFile}]\n`;
    }

    const title = cleanLatex(talk.title || '');
    const speaker = cleanLatex(talk.speaker || '');
    const affiliation = talk.affiliation ? ` (${cleanLatex(talk.affiliation)})` : '';
    const abstractText = cleanLatex((talk.abstract || '').replace(/\n/g, '\n\n'));

    output += `
\\subsection*{${title}}
\\addcontentsline{toc}{subsection}{${speaker}${affiliation}}
\\textbf{Speaker:} ${speaker}${affiliation}\\\\[0.5em]
\\textbf{Abstract:} ${abstractText}
`;

    if (bibFile) {
        output += `
\\vspace{1em}
\\noindent\\textbf{References}
\\vspace{0.5em}
\\nocite{*}
\\printbibliography[heading=none]
\\end{refsection}
`;
    }

    output += `
\\vspace{1em}
\\dotfill
\\vspace{1.5em}
`;
    return output;
}

texContent += `\\section{Invited Talks}\n\\vspace{0.5cm}\n`;
invitedTalks.forEach(talk => {
    texContent += generateTalkLatex(talk);
});

texContent += `\\newpage\n\\section{Contributed Talks}\n\\vspace{0.5cm}\n`;
contributedTalks.forEach(talk => {
    texContent += generateTalkLatex(talk);
});

texContent += `\\end{document}`;

try {
    fs.writeFileSync('book_of_abstracts.tex', texContent);
    console.log('SUCCESS: File book_of_abstracts.tex generato con successo da talks.json!');
} catch (err) {
    console.error("Errore durante la scrittura del file book_of_abstracts.tex:", err);
}