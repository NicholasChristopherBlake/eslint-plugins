const { isPathRelative } = require("../helpers");
const micromatch = require('micromatch');

module.exports = {
  meta: {
    messages: {
      'need-public-api': "Absolute import is allowed only from Public API (index.ts)",
      'testing-public-api': "Testing data must be imported from testing public API (testing.ts)"
    },
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Should check that we absolute import only from public API",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    // for autofix
    fixable: 'code', // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          },
          testFilesPatterns: {
            type: 'array',
          }
        }
      }
    ]
  },

  create(context) {
    const { alias = '', testFilesPatterns = [] } = context.options[0] ?? {}; // get options

    // no shared layer, because we don't need public API in shared layer
    const checkedLayers = {
      'entity': 'entity',
      'features': 'features',
      'pages': 'pages',
      'widgets': 'widgets'
    }

    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value; // delete alias if it exists

        // we only care about absolute imports, not relative
        if(isPathRelative(importTo)) {
          return;
        }
        // [features, ArticleList, ...] - when importing from public API we should only have 2 elements
        const segments = importTo.split('/')
        const layer = segments[0];
        const slice = segments[1];

        // check only for listed layers names: entity, features, widgets, pages
        if (!checkedLayers[layer]) {
          return;
        }

        const isImportNotFromPublicApi = segments.length > 2;
        // [features, articleList, testing] - third file 'testing' and it's last file (public API)
        const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4;

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report({
            node, 
            messageId: 'need-public-api',
            fix: (fixer) => {
              return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`)
            }
          });
        }

        if (isTestingPublicApi) {
          // imports from testing public API can be done ONLY to testing files - check it
          const currentFilePath = context.filename;

          // use micromatch to check if the file is test file
          const isCurrentFileTesting = testFilesPatterns.some(
            pattern => micromatch.isMatch(currentFilePath, pattern)
          )

          if (!isCurrentFileTesting) {
            context.report({
              node, 
              messageId: 'testing-public-api'
            })
          }
        }
      }
    };
  },
};
