const fs = require('fs');
let code = fs.readFileSync('hooks/useAppData.ts', 'utf8');

const targetStr = `        // Fetch fresh authoritative data from Firebase
        const [initialStds, initialClss, initialStgs, initialRdns] = await Promise.all([`;

const replacement = `        // Ensure pending background tasks are flushed to Firebase before fetching
        if (!dbService.isSyncing) {
          await dbService.triggerSync();
        }

        // Fetch fresh authoritative data from Firebase
        const [initialStds, initialClss, initialStgs, initialRdns] = await Promise.all([`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('hooks/useAppData.ts', code);
  console.log("Successfully injected triggerSync before fetch.");
} else {
  console.log("Could not find target string.");
}
