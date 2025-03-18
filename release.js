#!/usr/bin/env node

// Explicitly load .env file
import dotenv from 'dotenv';
import fs from 'fs';
import { spawnSync } from 'child_process';

// Check if token is already in environment
if (!process.env.GITHUB_TOKEN) {
  console.log('GITHUB_TOKEN not found in environment, loading from .env file...');
  
  // Load environment variables from .env file
  dotenv.config();
  
  // If still not found, try to read directly from the .env file
  if (!process.env.GITHUB_TOKEN) {
    try {
      const envFile = fs.readFileSync('.env', 'utf8');
      const match = envFile.match(/GITHUB_TOKEN=([^\s]+)/);
      if (match && match[1]) {
        process.env.GITHUB_TOKEN = match[1];
        console.log('Loaded GITHUB_TOKEN directly from .env file');
      } else {
        console.error('Error: Could not find GITHUB_TOKEN in .env file');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error reading .env file:', error.message);
      process.exit(1);
    }
  }
}

// Log success
console.log('GITHUB_TOKEN loaded successfully:', process.env.GITHUB_TOKEN.substring(0, 4) + '...');

// Args for release-it
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Add GitHub token to release-it call directly via arguments
const releaseItArgs = dryRun ? ['.', '--dry-run'] : ['.'];
releaseItArgs.push('--github.token', process.env.GITHUB_TOKEN);

// Spawn release-it process
const result = spawnSync(
  './node_modules/.bin/release-it', 
  releaseItArgs,
  { stdio: 'inherit' }
);

process.exit(result.status);