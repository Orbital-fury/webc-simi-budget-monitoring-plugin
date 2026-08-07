#!/usr/bin/env node
'use strict';

const { createHash } = require('node:crypto');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');

const mainJsPath = path.join(
  __dirname,
  '..',
  'dist',
  'webc-simi-budget-monitoring-plugin',
  'browser',
  'main.js',
);

if (!existsSync(mainJsPath)) {
  console.error(`Fichier introuvable : ${mainJsPath}`);
  process.exit(1);
}

const fileBuffer = readFileSync(mainJsPath);
const hash = createHash('sha256').update(fileBuffer).digest('base64');

console.log(`\nIntegrity de ${mainJsPath} :`);
console.log(`sha256-${hash}`);
