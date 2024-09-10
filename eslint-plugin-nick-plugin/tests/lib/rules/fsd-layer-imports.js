/**
 * @fileoverview Only lower layers are allowed to be imported in higher layers
 * @author Nick
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/fsd-layer-imports"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module' },
});

const aliasOptions = [
  {
    alias: '@'
  }
]

ruleTester.run("fsd-layer-imports", rule, {
  valid: [
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/shared/Button.tsx'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entity/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/app/providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/widgets/pages',
      code: "import { useLocation } from 'react-router-dom'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/app/providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'redux'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/index.tsx',
      code: "import { StoreProvider } from '@/app/providers/StoreProvider';",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/entity/Article.tsx',
      code: "import { StateSchema } from '@/app/providers/StoreProvider'",
      errors: [],
      options: [
        {
          alias: '@',
          ignoreImportPatterns: ['**/StoreProvider']
        }
      ],
    },
  ],

  invalid: [
    {
      filename: 'C:/Users/Nick/projects/production_project/src/entity/providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/Article'",
      errors: [{ message: "Layer can't be imported into higher or same-level layer (except shared and entities)"}],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/features/providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Article'",
      errors: [{ message: "Layer can't be imported into higher or same-level layer (except shared and entities)"}],
      options: aliasOptions,
    },
    {
      filename: 'C:/Users/Nick/projects/production_project/src/entity/providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Article'",
      errors: [{ message: "Layer can't be imported into higher or same-level layer (except shared and entities)"}],
      options: aliasOptions,
    },
  ],
});
