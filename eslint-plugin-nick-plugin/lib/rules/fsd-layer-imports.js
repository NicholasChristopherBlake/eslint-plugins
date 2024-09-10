/**
 * @fileoverview Only lower layers are allowed to be imported in higher layers
 * @author Nick
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const path = require('path');
const {isPathRelative} = require('../helpers');
const micromatch = require('micromatch');

module.exports = {
  meta: {
    messages: {
      'forbidden-layer-import': "Layer can't be imported into higher or same-level layer (except shared and entities)"
    },
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Only lower layers are allowed to be imported in higher layers",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreImportPatterns: {
            type: 'array',
          }
        },
      }
    ],
  },

  create(context) {
    const layers = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entity'],
      'pages': ['widgets', 'features', 'shared', 'entity'],
      'widgets': ['features', 'shared', 'entity'],
      'features': ['shared', 'entity'],
      'entity': ['shared', 'entity'], // sometimes entities can be imported in other entities
      'shared': ['shared'], // shared can be used in shared as well
    }

    // it is used to not check libraries folders
    const availableLayers = {
      'app': 'app',
      'entity': 'entity',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }

    const {alias = '', ignoreImportPatterns = []} = context.options[0] ?? {};

    const getCurrentFileLayer = () => {
      const currentFilePath = context.filename;

      const normalizedPath = path.toNamespacedPath(currentFilePath);
      const projectPath = normalizedPath?.split('src')[1];
      const segments = projectPath?.split(/\\|\//)

      return segments?.[1];
    }

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, '') : value;
      const segments = importPath?.split('/')

      return segments?.[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const currentFileLayer = getCurrentFileLayer()
        const importLayer = getImportLayer(importPath)

        // checking only absolute paths
        if(isPathRelative(importPath)) {
          return;
        }

        // check available layers to remove libraries folders
        if(!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return;
        }

        // using micromatch don't check ignored files
        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        });

        if(isIgnored) {
          return;
        }

        if(!layers[currentFileLayer]?.includes(importLayer)) {
          context.report({
            node, 
            messageId: 'forbidden-layer-import'
          });
        }
      }
    };
  },
};
