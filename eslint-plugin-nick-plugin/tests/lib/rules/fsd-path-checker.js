/**
 * @fileoverview feature sliced design relative path checker
 * @author Nick
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/fsd-path-checker"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});

ruleTester.run("fsd-path-checker", rule, {
  valid: [
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/ArticleList',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
  ],
  invalid: [
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/ArticleList',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'features/ArticleList/model/slices/addCommentFormSlice'",
      errors: [{ message: "In one Slice all imports must use relative paths" }],
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/ArticleList',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/ArticleList/model/slices/addCommentFormSlice'",
      errors: [{ message: "In one Slice all imports must use relative paths" }],
      options: [
        {
          alias: '@'
        }
      ]
    },
  ],
});
