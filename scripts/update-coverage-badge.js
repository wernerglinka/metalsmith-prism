#!/usr/bin/env node

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );
const rootDir = path.join( __dirname, '..' );

function determineBadgeColor( percentage ) {
  if ( percentage >= 90 ) {
    return 'brightgreen';
  }
  if ( percentage >= 80 ) {
    return 'green';
  }
  if ( percentage >= 70 ) {
    return 'yellowgreen';
  }
  if ( percentage >= 60 ) {
    return 'yellow';
  }
  if ( percentage >= 50 ) {
    return 'orange';
  }
  return 'red';
}

async function main() {
  try {
    process.stderr.write( 'Updating coverage badge in README.md...\n' );

    // Run the full test suite (both ESM and CJS tests)
    process.stderr.write( 'Running full test suite for coverage data...\n' );
    execSync( 'npm test', { stdio: 'inherit' } );

    // Get the coverage data from the c8 report
    process.stderr.write( 'Extracting coverage data from report...\n' );
    const coverageOutput = execSync( 'npx c8 report --reporter=text', { encoding: 'utf-8' } );

    // Parse the coverage report
    const coverageData = parseCoverageReport( coverageOutput );

    if ( coverageData ) {
      process.stderr.write( `Successfully parsed coverage data\n` );
      await updateReadme( coverageData );
    } else {
      console.error( 'ERROR: Could not parse coverage data from c8 report' );
      process.exit( 1 );
    }
  } catch ( error ) {
    console.error( 'Error updating coverage badge:', error );
    process.exit( 1 );
  }
}

function parseCoverageReport( report ) {
  try {
    const lines = report.split( '\n' );

    // Find the "All files" line
    const allFilesLine = lines.find( ( line ) => line.includes( 'All files' ) );

    if ( !allFilesLine ) {
      console.error( 'ERROR: Could not find "All files" line in coverage report' );
      return null;
    }

    // Parse the coverage values
    const values = allFilesLine.split( '|' ).map( ( v ) => v.trim() );

    if ( values.length < 5 ) {
      console.error( 'ERROR: Coverage report format is invalid' );
      return null;
    }

    // Get individual file data
    const fileData = [];
    for ( let i = 0; i < lines.length; i++ ) {
      // Skip header lines and summary lines
      if (
        lines[ i ].includes( 'File' ) ||
        lines[ i ].includes( 'All files' ) ||
        lines[ i ].includes( '---' ) ||
        !lines[ i ].trim()
      ) {
        continue;
      }

      // This should be a file line
      const fileValues = lines[ i ].split( '|' ).map( ( v ) => v.trim() );
      if ( fileValues.length >= 5 ) {
        const filePath = fileValues[ 0 ].trim();
        // Only include actual source files (skip directories)
        if ( !filePath.includes( 'All files' ) && !filePath.endsWith( '/' ) ) {
          fileData.push( {
            path: filePath,
            statements: fileValues[ 1 ],
            branches: fileValues[ 2 ],
            functions: fileValues[ 3 ],
            lines: fileValues[ 4 ],
            uncoveredLines: fileValues.length > 5 ? fileValues[ 5 ] : ''
          } );
        }
      }
    }

    return {
      summary: {
        statements: parseFloat( values[ 1 ] ),
        branches: parseFloat( values[ 2 ] ),
        functions: parseFloat( values[ 3 ] ),
        lines: parseFloat( values[ 4 ] )
      },
      files: fileData
    };
  } catch ( error ) {
    console.error( `Error parsing coverage report: ${ error.message }` );
    return null;
  }
}

async function updateReadme( coverageData ) {
  try {
    // Find the src directory coverage data
    const srcEntry = coverageData.files.find( ( file ) => file.path.trim() === 'src' );

    // Use src coverage if available, otherwise use overall coverage
    let coveragePercentage;
    if ( srcEntry ) {
      coveragePercentage = Math.round( parseFloat( srcEntry.lines ) );
      process.stderr.write( `Source code coverage: ${ coveragePercentage }%\n` );
    } else {
      coveragePercentage = Math.round( coverageData.summary.lines );
      process.stderr.write( `Overall coverage: ${ coveragePercentage }%\n` );
    }

    // Determine badge color based on coverage percentage
    const badgeColor = determineBadgeColor( coveragePercentage );

    // Read README.md
    const readmePath = path.join( rootDir, 'README.md' );
    const readme = await fs.readFile( readmePath, 'utf-8' );

    // Look for different badge formats and replace the correct one
    const badgePatterns = [
      /\[coverage-badge\]: https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-[a-z]+/,
      /\[coverage-badge\]: https:\/\/img\.shields\.io\/badge\/test%20coverage-\d+%25-[a-z]+/
    ];

    // Create possible new badge formats
    const newBadgeFormats = [
      `[coverage-badge]: https://img.shields.io/badge/coverage-${ coveragePercentage }%25-${ badgeColor }`,
      `[coverage-badge]: https://img.shields.io/badge/test%20coverage-${ coveragePercentage }%25-${ badgeColor }`
    ];

    let updatedReadme = readme;
    let badgeFound = false;

    // Try to replace with the correct format
    for ( let i = 0; i < badgePatterns.length; i++ ) {
      if ( badgePatterns[ i ].test( readme ) ) {
        updatedReadme = readme.replace( badgePatterns[ i ], newBadgeFormats[ i ] );
        badgeFound = true;
        break;
      }
    }

    if ( !badgeFound ) {
      console.error( 'ERROR: Could not find coverage badge in README.md' );
      process.exit( 1 );
    }

    // Write updated README.md
    await fs.writeFile( readmePath, updatedReadme, 'utf-8' );
    process.stderr.write( 'Updated README.md with current coverage information\n' );
  } catch ( error ) {
    console.error( 'Error updating README:', error );
    process.exit( 1 );
  }
}

main();
