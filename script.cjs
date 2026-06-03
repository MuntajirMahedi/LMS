const fs = require('fs');
let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// 1. Revert font & main wrapper
content = content.replace(/<div className="min-h-screen bg-\[\#1A1515\].*?>/g, '<div className="min-h-screen bg-soft-oat text-foreground font-[\'Inter\',sans-serif] overflow-x-hidden">');
content = content.replace(/<style>\{`[\s\S]*?`\}<\/style>/g, '');

// 2. Fix text colors back to foreground
content = content.replace(/text-white\/90/g, 'text-foreground');
content = content.replace(/text-white\/60/g, 'text-muted-foreground');
content = content.replace(/text-white\/50/g, 'text-[#3A2C2B]/50');

// 3. Fix background colors of sections
// Instead of complex regex for classes, just replace the entire class strings for the sections:

content = content.replace(/className=\"py-16 lg:py-24 bg-\[\#211A1A\] border-y border-border\/30\"/g, 'className=\"py-16 lg:py-24 bg-soft-honey border-y border-border\/30\"'); // Trust
content = content.replace(/<section id=\"features\" className=\"py-20 lg:py-28 bg-transparent\"/g, '<section id=\"features\" className=\"py-20 lg:py-28 bg-soft-sage\"');
content = content.replace(/<section id=\"solutions\" className=\"py-20 lg:py-28 bg-\[\#211A1A\]\"/g, '<section id=\"solutions\" className=\"py-20 lg:py-28 bg-soft-clay\"');
content = content.replace(/<section id=\"modules\" className=\"py-20 lg:py-28 bg-transparent\"/g, '<section id=\"modules\" className=\"py-20 lg:py-28 bg-soft-parchment\"');
content = content.replace(/<section className=\"py-20 lg:py-28 bg-\[\#211A1A\]\"/g, '<section className=\"py-20 lg:py-28 bg-soft-sky\"'); // Why choose us
content = content.replace(/<section id=\"testimonials\" className=\"py-20 lg:py-28 bg-transparent\"/g, '<section id=\"testimonials\" className=\"py-20 lg:py-28 bg-soft-honey\"');
content = content.replace(/<section id=\"pricing\" className=\"py-20 lg:py-28 bg-\[\#1A1515\] border-t border-border\/30\"/g, '<section id=\"pricing\" className=\"py-20 lg:py-28 bg-soft-sage\"');
content = content.replace(/<section className=\"py-20 lg:py-28 bg-transparent\"/g, '<section className=\"py-20 lg:py-28 bg-soft-clay\"'); // FAQ

// Fix Cards in Features
content = content.replace(/bg-\[\#2A1F1E\]/g, 'bg-white');
content = content.replace(/bg-\[\#3A2C2B\]/g, 'bg-white');

// We replaced some white text that should stay white
content = content.replace(/bg-primary text-foreground/g, 'bg-primary text-white');

fs.writeFileSync('src/pages/LandingPage.tsx', content);
console.log('Done mapping soft colors!');
