/**
 * @fileoverview feature sliced design relative path checker
 * @author Nick
 */
"use strict";

const path = require("path");
const { isPathRelative } = require("../helpers");
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    messages: {
      "slice-relative-path": "In one Slice all imports must use relative paths",
    },
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced design relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code", // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            type: "string",
          },
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias || ""; // get alias from options
    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        // try ... catch for errors with folder which are not in src
        try {
          // example app/features/ArticleList
          const value = node.source.value;
          const importTo = alias ? value.replace(`${alias}/`, "") : value; // delete alias if it exists
          // example C:/Users/Nick/projects/production_project/src/features/ArticleList
          const fromFilename = context.filename;
          if (shouldBeRelative(fromFilename, importTo)) {
            context.report({
              node,
              messageId: "slice-relative-path",
              // autofixer for this rule
              fix: (fixer) => {
                // entity/Article/Article.tsx ...
                const normalizedPath = getNormalizedCurrentFilePath(
                  fromFilename
                )
                  .split("/")
                  .slice(0, -1) // remove name of the file and leave only path to folder
                  .join("/");
                // get relative path between from and to, add / to importTo
                let relativePath = path
                  .relative(normalizedPath, `/${importTo}`)
                  .split("\\")
                  .join("/");

                // Add ./ manually, because path.relative doesn't do it automatically
                if (!relativePath.startsWith(".")) {
                  relativePath = "./" + relativePath;
                }

                return fixer.replaceText(node.source, `'${relativePath}'`);
              },
            });
          }
        } catch (e) {
          console.log("Error occured while checking path");
        }
      },
    };
  },
};

const layers = {
  shared: "shared",
  entity: "entity",
  features: "features",
  widgets: "widgets",
  pages: "pages",
};

function getNormalizedCurrentFilePath(currentFilePath) {
  // use method from path to normalize path to unified format
  const normalizedPath = path.toNamespacedPath(currentFilePath);
  // leave only things after `src` - [1] because only the right part
  const projectFrom = normalizedPath.split("src")[1];
  // change all \\ to / in paths
  // optional, because we are binded to src folder
  return projectFrom?.split("\\").join("/");
}

// path should be relative only inside one module
function shouldBeRelative(from, to) {
  // first argument - file where we are currently at
  // second argument - import that we check
  if (isPathRelative(to)) {
    return false;
  } // is path is relative - return false
  const toArray = to.split("/");
  const toLayer = toArray[0]; // entity
  const toSlice = toArray[1]; // Article

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const projectFrom = getNormalizedCurrentFilePath(from);
  // we manually change '\\' to '/' in getNormalizedCurre.. function
  // so maybe you should change this to .split('/') now
  const fromArray = projectFrom.split(/\\|\//);

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  // return true - need to change path to relative
  return fromSlice === toSlice && toLayer === fromLayer;
}

