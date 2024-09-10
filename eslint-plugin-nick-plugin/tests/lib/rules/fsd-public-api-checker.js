/**
 * @fileoverview Should check that we absolute import only from public API
 * @author Nick
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/fsd-public-api-checker"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});

const aliasOptions = [
  {
    alias: '@'
  }
]

ruleTester.run("fsd-public-api-checker", rule, {
  valid: [
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList'",
      errors: [],
      options: aliasOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/app/App/something/something'",
      errors: [],
      options: aliasOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/shared/App/something/something'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/file.test.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList/testing'",
      errors: [],
      options: [{
        alias: '@',
        testFilesPatterns: ['**/*.test.*', '**/*.stories.*', '**/StoreDecorator.tsx']
      }],
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/widgets/StoreDecorator.tsx',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/ArticleList/testing'",
      errors: [],
      options: [{
        alias: '@',
        testFilesPatterns: ['**/*.test.*', '**/*.stories.*', '**/StoreDecorator.tsx']
      }],
    }
  ],

  invalid: [
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList/model/file.ts'",
      errors: [{ messageId: 'need-public-api' }],
      options: aliasOptions,
      output: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList'",
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/ArticleList',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList/testing/file.tsx'",
      errors: [{message: 'Absolute import is allowed only from Public API (index.ts)'}],
      options: [{
        alias: '@',
        testFilesPatterns: ['**/*.test.*', '**/*.stories.*', '**/StoreDecorator.tsx']
      }],
      output: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList'"
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/ArticleList',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList/testing'",
      errors: [{ messageId: 'testing-public-api' }],
      options: [{
        alias: '@',
        testFilesPatterns: ['**/*.test.*', '**/*.stories.*', '**/StoreDecorator.tsx']
      }],
      output: null
    }
  ],
});
