import { load } from 'cheerio';
import { extname } from 'path';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import he from 'he';
import debugLib from 'debug';

const debug = debugLib( 'metalsmith-prism' );

// Import languages from Prism's default export
const { languages } = Prism;

/**
 * Check if a file is HTML based on its extension
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if the file has an HTML extension
 */
const isHTMLFile = ( filePath ) => {
  const extension = extname( filePath ).toLowerCase();
  return [ '.html', '.htm' ].includes( extension );
};

/**
 * @typedef Options
 * @property {boolean} [decode=false] - Whether to decode HTML entities
 * @property {boolean} [lineNumbers=false] - Whether to add line numbers
 * @property {string[]} [preLoad=[]] - Languages to preload
 */

/**
 * Metalsmith plugin to highlight code syntax with PrismJS
 *
 * This plugin finds all code blocks in HTML files that have language-* classes
 * and applies Prism.js syntax highlighting to them. It can also add line numbers
 * and handle HTML entity decoding.
 *
 * @param {Options} [options] - Configuration options
 * @param {boolean} [options.decode=false] - Whether to decode HTML entities in code blocks
 * @param {boolean} [options.lineNumbers=false] - Whether to add line numbers to code blocks
 * @param {string[]} [options.preLoad=[]] - Languages to preload before processing
 * @returns {import('metalsmith').Plugin} - A metalsmith plugin function
 * @example
 * // Basic usage
 * metalsmith.use(prism());
 *
 * // With options
 * metalsmith.use(prism({
 *   decode: true,
 *   lineNumbers: true,
 *   preLoad: ['java', 'scala']
 * }));
 */
const metalsmithPrism = ( options = {} ) => {
  // Create a new options object with defaults
  const opts = {
    decode: false,
    lineNumbers: false,
    preLoad: [],
    ...options
  };

  // Track loaded languages to avoid duplicate loading
  const loadedLanguages = new Set();

  // Always load PHP by default
  debug( 'Loading PHP by default' );
  try {
    loadLanguages( [ 'php' ] );
    loadedLanguages.add( 'php' );
  } catch ( e ) {
    debug( 'Failed to load PHP:', e );
  }

  if ( opts.preLoad && opts.preLoad.length ) {
    debug( 'Preloading languages:', opts.preLoad );
    opts.preLoad.forEach( ( language ) => {
      if ( !loadedLanguages.has( language ) ) {
        try {
          loadLanguages( [ language ] );
          loadedLanguages.add( language );
          debug( `Successfully preloaded language: ${ language }` );
        } catch ( e ) {
          console.warn( `Failed to preload prism syntax: ${ language }!`, e );
          debug( `Error preloading language ${ language }:`, e );
        }
      } else {
        debug( `Language ${ language } already loaded, skipping` );
      }
    } );
  }

  /**
   * Require optional language package
   * @param {string} language
   * @param {Set} loadedLanguages
   */
  const requireLanguage = ( language, loadedLanguages ) => {
    if ( loadedLanguages.has( language ) || languages[ language ] ) {
      debug( `Language ${ language } already available, skipping load` );
      return;
    }

    debug( `Loading language on-demand: ${ language }` );
    try {
      loadLanguages( [ language ] );
      loadedLanguages.add( language );
      debug( `Successfully loaded language: ${ language }` );
    } catch ( e ) {
      console.warn( `Failed to load prism syntax: ${ language }!`, e );
      debug( `Error loading language ${ language }:`, e );
    }
  };

  // Set up line numbers functionality
  const NEW_LINE_EXP = /\n(?!$)/g;
  let lineNumbersWrapper;

  // Only set up the hook if line numbers are requested
  if ( opts.lineNumbers ) {
    debug( 'Setting up line numbers hook' );
    Prism.hooks.add( 'after-tokenize', ( env ) => {
      const match = env.code.match( NEW_LINE_EXP );
      const linesNum = match ? match.length + 1 : 1;
      debug( `Counted ${ linesNum } lines for line numbers` );
      const lines = new Array( linesNum + 1 ).join( '<span></span>' );
      lineNumbersWrapper = `<span aria-hidden="true" class="line-numbers-rows">${ lines }</span>`;
    } );
  }

  return ( files, metalsmith, done ) => {
    debug( 'Starting metalsmith-prism plugin' );
    debug( 'Options:', opts );

    // Call done asynchronously to avoid blocking
    setImmediate( done );

    try {
      Object.keys( files ).forEach( ( file ) => {
        if ( !isHTMLFile( file ) ) {
          return;
        }

        debug( `Processing HTML file: ${ file }` );
        const contents = files[ file ].contents.toString();
        const $ = load( contents, { decodeEntities: false } );
        let highlighted = false;
        const code = $( 'code' );

        if ( !code.length ) {
          debug( `No code blocks found in ${ file }` );
          return;
        }

        debug( `Found ${ code.length } code blocks in ${ file }` );

        code.each( function() {
          const $this = $( this );

          const className = $this.attr( 'class' ) || '';
          const targets = className.split( 'language-' );
          let addLineNumbers = false;

          if ( targets.length > 1 ) {
            const $pre = $this.parent( 'pre' );

            if ( $pre ) {
              // Copy className to <pre> container
              $pre.addClass( className );

              if ( opts.lineNumbers ) {
                $pre.addClass( 'line-numbers' );
                addLineNumbers = true;
                debug( 'Adding line numbers' );
              }
            }

            highlighted = true;
            let language = targets[ 1 ];
            debug( `Detected language: ${ language }` );
            requireLanguage( language, loadedLanguages );

            if ( !languages[ language ] ) {
              debug( `Language ${ language } not available, falling back to markup` );
              language = 'markup';
            }

            const html = language === 'markup' && !opts.decode ? $this.html() : he.decode( $this.html() );
            debug( `HTML decoding ${ opts.decode ? 'applied' : 'not applied' } for language ${ language }` );

            debug( `Highlighting code with language: ${ language }` );
            const highlightedCode = Prism.highlight( html, languages[ language ] );
            $this.html( addLineNumbers ? highlightedCode + lineNumbersWrapper : highlightedCode );
          }
        } );

        if ( highlighted ) {
          debug( `Updating contents of ${ file } with highlighted code` );
          files[ file ].contents = Buffer.from( $.html() );
        } else {
          debug( `No code was highlighted in ${ file }` );
        }
      } );

      debug( 'Completed metalsmith-prism plugin' );
    } catch ( error ) {
      debug( 'Error in metalsmith-prism plugin:', error );
      // We can't call done(error) here because done has already been called
      console.error( 'Error processing files:', error );
    }
  };
};

// ESM export
export default metalsmithPrism;
