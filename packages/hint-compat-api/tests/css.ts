import { fs, test } from '@hint/utils';
import { testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const { readFile } = fs;

const hintPath = getHintPath(__filename, true);

const generateCSSConfig = (fileName: string) => {
    const path = 'fixtures/css';
    const styles = readFile(`${__dirname}/${path}/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const targetBrowsers = ['chrome 73-74', 'edge 15-16', 'firefox 65-66', 'ie 9-11'];

testHint(hintPath,
    [
        {
            name: 'Reports unsupported CSS at-rules',
            reports: [
                {
                    message: '@keyframes is not supported by ie 9.',
                    position: { match: '@keyframes' }
                }
            ],
            serverConfig: generateCSSConfig('atrules')
        },
        {
            name: 'Does not report ignored CSS features by default',
            serverConfig: generateCSSConfig('ignore')
        },
        {
            name: 'Reports unsupported properties, respecting prefixes and fallback',
            reports: [
                {
                    message: 'appearance is not supported by ie 9-11.',
                    position: { match: 'appearance: button; /* Report 1 */' }
                },
                {
                    message: 'appearance is not supported by ie 9-11.',
                    position: { match: 'appearance: button; /* Report 2 */' }
                },
                {
                    message: '-webkit-appearance is not supported by ie 9-11.',
                    position: { match: '-webkit-appearance: button; /* Report 3 */' }
                },
                {
                    message: '-moz-appearance is not supported by ie 9-11.',
                    position: { match: '-moz-appearance: button; /* Report 4 */' }
                },
                {
                    message: '-webkit-appearance is not supported by firefox 65-66, ie 9-11.',
                    position: { match: '-webkit-appearance: button; /* Report 5 */' }
                },
                {
                    message: 'appearance is not supported by chrome 73-74, edge 15-16, firefox 65-66, ie 9-11.',
                    position: { match: 'appearance: button; /* Report 6 */' }
                }
            ],
            serverConfig: generateCSSConfig('properties')
        },
        /*
         * TODO: Uncomment after re-enabling CSS selector support.
         *
         * {
         *     name: 'Reports unsupported CSS selectors',
         *     reports: [
         *         {
         *             message: ':valid is not supported by ie 9.',
         *             position: { match: ':valid' }
         *         }
         *     ],
         *     serverConfig: generateCSSConfig('selectors')
         * },
         */
        {
            name: 'Respects CSS @supports rules when generating reports',
            reports: [
                {
                    message: 'display: grid is not supported by edge 15.',
                    position: { match: 'display: grid; /* Report */' }
                }
            ],
            serverConfig: generateCSSConfig('supports')
        },
        {
            name: 'Reports unsupported CSS property values, respecting prefixes and fallback',
            reports: [
                {
                    message: 'display: grid is not supported by ie 9.',
                    position: { match: 'display: grid; /* Report 1 */' }
                },
                {
                    message: 'display: grid is not supported by ie 9.',
                    position: { match: 'display: grid; /* Report 2 */' }
                },
                {
                    message: 'display: -ms-grid is not supported by chrome 73-74, firefox 65-66, ie 9.',
                    position: { match: 'display: -ms-grid; /* Report 3 */' }
                },
                {
                    message: 'display: grid is not supported by edge 15, ie 9-11.',
                    position: { match: 'display: grid; /* Report 4 */' }
                }
            ],
            serverConfig: generateCSSConfig('values')
        }
    ],
    {
        browserslist: targetBrowsers,
        parsers: ['css']
    }
);

testHint(hintPath,
    [
        {
            name: 'Does not report prefixed CSS at-rules if unprefixed support exists',
            serverConfig: generateCSSConfig('atrules')
        }
    ],
    {
        browserslist: ['ie 11'],
        parsers: ['css']
    }
);

testHint(hintPath,
    [
        {
            name: 'Reports overridden ignored CSS features',
            reports: [
                {
                    message: 'appearance is not supported by ie 9-11.',
                    position: { match: 'appearance: none; /* unprefixed */' }
                }
            ],
            serverConfig: generateCSSConfig('ignore')
        },
        {
            name: 'Does not report manually ignored CSS features',
            serverConfig: generateCSSConfig('values')
        }
    ],
    {
        browserslist: targetBrowsers,
        hintOptions: {
            enable: ['-moz-appearance: none', '-webkit-appearance: none', 'appearance: none'],
            ignore: ['display: grid', 'display: -ms-grid']
        },
        parsers: ['css']
    }
);
