'use strict';

const fs = require('fs');
const path = require('path');

const startDir = path.join(__dirname, '..');

function resolveCleanupRoot() {
  let current = startDir;
  const filesystemRoot = path.parse(current).root;

  while (current !== filesystemRoot) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }

    current = path.dirname(current);
  }

  return startDir;
}

/**
 * Recursively removes macOS resource fork files (._*) created when unpacking zips.
 * These binary stubs break tooling that dynamically requires every file in a folder.
 */
function removeAppleDoubleEntries(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.name.startsWith('._')) {
      try {
        fs.rmSync(fullPath, { recursive: entry.isDirectory(), force: true });
      } catch (error) {
        // Non-fatal: skip entries we cannot delete (permissions, etc.).
      }
      continue;
    }

    if (entry.isDirectory()) {
      removeAppleDoubleEntries(fullPath);
    }
  }
}

removeAppleDoubleEntries(resolveCleanupRoot());
