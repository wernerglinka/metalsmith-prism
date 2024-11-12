'use strict';

const cheerio = require( 'cheerio' );
const debug = require( 'debug' )( 'metalsmith-prism' );
const extname = require( 'path' ).extname;
const languages = require( 'prismjs' ).languages;
const Prism = require( 'prismjs' );

const loadLanguages = require( 'prismjs/components/' );
loadLanguages( [ 'php' ] );

const he = require( 'he' );

const isHTMLFile = ( filePath ) => {
  return /\.html|\.htm/.test( extname( filePath ) );
};


/**
 * Metalsmith plugin to highlight code syntax with PrismJS
 *
 * @param {Object} options
 * @returns
 */

module.exports = ( options ) => {

  options = options || {};

  if ( options.preLoad ) {
    //list of available languages: https://github.com/PrismJS/prism/tree/master/components
    options.preLoad.forEach( ( language ) => {
      try {
        require( `prismjs/components/prism-${ language }.js` );
      } catch ( e ) {
        /* eslint no-console: 0 */
        console.warn( `Failed to preload prism syntax: ${ language } !` );
      }
    } );
  }

  /**
   * requireLanguage
   * Require optional language package
   *
   * @param {*} language
   */
  function requireLanguage( language ) {
    if ( !languages[ language ] ) {
      try {
        require( `prismjs/components/prism-${ language }.js` );
      } catch ( e ) {
        /* eslint no-console: 0 */
        console.warn( `Failed to load prism syntax: ${ language } !` );
      }
    }
  }


  /**
   * Prism hook "after-tokenize" used to add html for line numbers
   * Neccessary as we don't have a browser
   *
   * Sources:
   * https://github.com/PrismJS/prism/blob/master/plugins/line-numbers/prism-line-numbers.js#L109
   * https://stackoverflow.com/questions/59508413/static-html-generation-with-prismjs-how-to-enable-line-numbers
   *
   */
  const NEW_LINE_EXP = /\n(?!$)/g;
  let lineNumbersWrapper;

  Prism.hooks.add( 'after-tokenize', function( env ) {
    const match = env.code.match( NEW_LINE_EXP );
    const linesNum = match ? match.length + 1 : 1;
    const lines = new Array( linesNum + 1 ).join( '<span></span>' );

    lineNumbersWrapper = `<span aria-hidden="true" class="line-numbers-rows">${ lines }</span>`;
  } );

  return function( files, metalsmith, done ) {

    setImmediate( done );

    Object.keys( files ).forEach( file => {

      if ( !isHTMLFile( file ) ) {
        return;
      }

      const contents = files[ file ].contents.toString();
      const $ = cheerio.load( contents, { decodeEntities: false }, true );
      let highlighted = false;
      const code = $( 'code' );

      if ( !code.length ) return;

      code.each( function() {
        const $this = $( this );

        const className = $this.attr( 'class' ) || '';
        const targets = className.split( 'language-' );
        let addLineNmbers = false;

        if ( targets.length > 1 ) {

          const $pre = $this.parent( 'pre' );

          if ( $pre ) {
            // Copy className to <pre> container
            $pre.addClass( className );

            if ( options.lineNumbers ) {
              debug( 'adding line numbers' );
              $pre.addClass( 'line-numbers' );
              addLineNmbers = true;
            }
          }

          highlighted = true;
          let language = targets[ 1 ];
          requireLanguage( language );

          if ( !languages[ language ] ) {
            language = 'markup';
          }
          const html = ( language === 'markup' && !options.decode ) ? $this.html() : he.decode( $this.html() );
          const highlightedCode = Prism.highlight( html, Prism.languages[ language ] );
          $this.html( addLineNmbers ? highlightedCode + lineNumbersWrapper : highlightedCode );

        }
      } );

      if ( highlighted ) {
        files[ file ].contents = Buffer.from( $.html() );
      }
    } );
  };
};
