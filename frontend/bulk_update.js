const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// 1. Imports
code = code.replace(/import \{ API_BASE_URL \} from '\.\.\/config\/api';/, "import { API_BASE_URL } from '../config/api';\nimport { fetchWithAuth } from '../utils/api';\nimport { getCookie, setCookie, removeCookie } from '../utils/storage';");

// 2. localStorage replacements
code = code.replace(/localStorage\.getItem\('([^']+)'\)/g, "getCookie('$1')");
code = code.replace(/localStorage\.setItem\('([^']+)',\s*(.*?)\)/g, "setCookie('$1', $2)");
code = code.replace(/localStorage\.removeItem\('([^']+)'\)/g, "removeCookie('$1')");

// 3. fetch replacements
code = code.replace(/fetch\(`\$\{API_BASE_URL\}/g, "fetchWithAuth(`${API_BASE_URL}");

// 4. Manual Authorization headers inside fetchWithAuth are now redundant. 
// It's mostly safe to leave them, but the requirement wants them handled by fetchWithAuth.
// fetchWithAuth will overwrite or merge headers.

fs.writeFileSync('src/pages/Dashboard.jsx', code);
console.log('Dashboard updated successfully');
