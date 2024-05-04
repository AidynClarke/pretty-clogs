const readline = require('readline');
const stream = process.stdin;
const rl = readline.createInterface({
  input: stream,
  crlfDelay: Infinity
});

let first = true;

rl.on('line', (input) => {
  if (first === false) return;
  first = false;
  const regex = /(\d+) low|(\d+) moderate|(\d+) high|(\d+) critical/g;
  let match;
  let low = 0;
  let moderate = 0;
  let high = 0;
  let critical = 0;
  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      low = parseInt(match[1]);
    }
    if (match[2]) {
      moderate = parseInt(match[2]);
    }
    if (match[3]) {
      high = parseInt(match[3]);
    }
    if (match[4]) {
      critical = parseInt(match[4]);
    }
  }

  const badge = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="242" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
      <rect width="242" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <path fill="#555" d="M0 0h150v20H0z"/>
      <path fill="#C71585" d="M150 0h24v20H150z"/>
      <path fill="#DC143C" d="M173 0h24v20H173z"/>
      <path fill="#D2691E" d="M196 0h24v20H196z"/>
      <path fill="#292929" d="M219 0h24v20H219z"/>
      <path fill="url(#b)" d="M0 0h242v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="76.0" y="15" fill="#010101" fill-opacity=".3">Package Vulnerabilities</text>
      <text x="75.0" y="14">Package Vulnerabilities</text>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="163.0" y="15" fill="#010101" fill-opacity=".3">${critical}</text>
      <text x="162.0" y="14">${critical}</text>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="186.0" y="15" fill="#010101" fill-opacity=".3">${high}</text>
      <text x="185.0" y="14">${high}</text>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="209.0" y="15" fill="#010101" fill-opacity=".3">${moderate}</text>
      <text x="208.0" y="14">${moderate}</text>
    </g>
    <g fill="#ffffff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="232.0" y="15" fill="#010101" fill-opacity=".3">${low}</text>
      <text x="231.0" y="14">${low}</text>
    </g>
  </svg>`;
  console.log(badge);
  rl.close();
});
