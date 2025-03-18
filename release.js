#!/usr/bin/env node

// Explicitly load .env file
import dotenv from 'dotenv';
import { spawnSync } from 'child_process';

// Load environment variables from .env
dotenv.config();

// Check if GITHUB_TOKEN was loaded
if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN not found in environment variables.');
  console.error('Make sure you have a .env file with GITHUB_TOKEN=your_token');
  process.exit(1);
}

// Log success
console.log('GITHUB_TOKEN loaded successfully:', process.env.GITHUB_TOKEN.substring(0, 4) + '...');

// Args for release-it
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Spawn release-it process
const result = spawnSync(
  './node_modules/.bin/release-it', 
  dryRun ? ['.', '--dry-run'] : ['.'], 
  { 
    stdio: 'inherit',
    env: process.env 
  }
);

process.exit(result.status);