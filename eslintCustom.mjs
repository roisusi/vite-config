/**
 * @fileoverview Enforce a blank line after the closing curly brace of a block.
 *
 * This rule applies to every multi-line block (including arrow function bodies).
 * It requires that the token immediately following the block (or the semicolon
 * if one is present) appears at least two lines later (i.e. with a blank line in between).
 *
 * Example:
 *
 * NOT OK:
 *   const ab = (hello: string): string => {
 *     console.log(hello);
 *     return 'Hello World';
 *   };
 *   const a = 'd';
 *
 * OK:
 *   const ab = (hello: string): string => {
 *     console.log(hello);
 *     return 'Hello World';
 *   };
 *
 *   const a = 'd';
 */

export const blankLineAfterClosing = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a blank line after the closing curly brace of a block.',
      category: 'Stylistic Issues',
      recommended: false
    },
    fixable: 'whitespace',
    schema: [] // no options
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      BlockStatement(node) {
        // Only apply to blocks that span multiple lines.
        if (node.loc.start.line === node.loc.end.line) {
          return;
        }

        // Get the closing curly brace.
        const closingBrace = sourceCode.getLastToken(node);
        if (!closingBrace) {
          return;
        }

        // Get the token immediately after the block.
        let tokenAfter = sourceCode.getTokenAfter(closingBrace, { includeComments: true });
        let fixToken = closingBrace;
        // If the token after is a semicolon, treat that semicolon as part of the block.
        if (tokenAfter && tokenAfter.value === ';') {
          fixToken = tokenAfter;
          tokenAfter = sourceCode.getTokenAfter(tokenAfter, { includeComments: true });
        }
        if (!tokenAfter) return;

        const fixTokenEndLine = fixToken.loc.end.line;
        const nextTokenStartLine = tokenAfter.loc.start.line;
        // If the next token starts less than 2 lines after fixToken, there is no blank line.
        if (nextTokenStartLine < fixTokenEndLine + 2) {
          context.report({
            node: closingBrace,
            message: 'Expected a blank line after the closing curly brace.',
            fix(fixer) {
              // Insert a newline after fixToken.
              return fixer.insertTextAfter(fixToken, '\n');
            }
          });
        }
      }
    };
  }
};


/**
 * @fileoverview Enforce that all comments must include the word "todo" (case-insensitive).
 */

export const requireTodoInComments = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that all comments must include the word "todo" (case-insensitive).',
      category: 'Stylistic Issues',
      recommended: false
    },
    fixable: null, // This rule doesn't have an auto-fix
    schema: [] // no options
  },
  create(context) {
    // Only run this rule for .ts or .tsx files.
    const filename = context.getFilename();
    console.log(filename.includes('vite.config.ts'));
    console.log(filename);
    if (!filename.endsWith('.ts') && !filename.endsWith('.tsx') || filename.includes('vite.config.ts')) {
      return {};
    }
    return {
      Program() {
        const sourceCode = context.getSourceCode();
        // Retrieve all comments in the file
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          // Check if the comment text contains "todo" (case-insensitive)
          if (!/todo/i.test(comment.value) && !/eslint/i.test(comment.value)) {
            context.report({
              loc: comment.loc,
              message: 'Comment must include "TODO" (case-insensitive) or "eslint".'
            });
          }
        });
      }
    };
  }
};

/**
 * @fileoverview Enforce that type aliases must not be defined as object literal types.
 * They must be defined as a non-object type or a union type that does not include object literals.
 *
 * Allowed:
 *   type MyString = string;
 *   type MyUnion = string | number;
 *
 * Not Allowed:
 *   type MyObject = { name: string };
 *   type Mixed = { name: string } | number;
 */

export const requireUnionTypeInAlias = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Type alias must not be defined as an object literal type. Use non-object or union types instead.',
      category: 'Stylistic Issues',
      recommended: false
    },
    schema: [] // no options
  },
  create(context) {
    // Helper: Recursively check if a type node contains an object literal.
    function containsObjectLiteral(typeNode) {
      if (!typeNode) {
        return false;
      }
      switch (typeNode.type) {
        case 'TSTypeLiteral':
          return true;
        case 'TSUnionType':
          return typeNode.types.some(t => containsObjectLiteral(t));
        case 'TSParenthesizedType':
          return containsObjectLiteral(typeNode.typeAnnotation);
        default:
          return false;
      }
    }

    return {
      TSTypeAliasDeclaration(node) {
        // If the type annotation contains an object literal, report an error.
        if (containsObjectLiteral(node.typeAnnotation)) {
          context.report({
            node: node.typeAnnotation,
            message: 'Type alias must not be defined as an object literal. Use interface instead.'
          });
        }
      }
    };
  }
};

/**
 * @fileoverview Disallow hex color codes in the code.
 *
 * This rule checks for any string or template literal that contains a hex color code.
 * Hex color codes are identified by a '#' followed by either 3 or 6 hexadecimal characters.
 *
 * For example:
 *   // Not OK:
 *   const primary = "#ff0000";
 *   const secondary = `Color: #0F0`;
 *
 *   // OK:
 *   const primary = "red";
 */

export const noHexColor = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hex color codes in the code.',
      category: 'Stylistic Issues',
      recommended: false
    },
    schema: [] // no options
  },
  create(context) {
    // Regular expression to match hex colors:
    // Matches strings like "#fff" or "#ffffff" (case insensitive)
    const hexColorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/;

    return {
      Literal(node) {
        if (typeof node.value === 'string' && hexColorRegex.test(node.value)) {
          context.report({
            node,
            message: 'Hex color codes are not allowed in code.'
          });
        }
      },
      TemplateLiteral(node) {
        // Check each "quasi" (the literal portions) in a template literal.
        node.quasis.forEach((quasi) => {
          if (hexColorRegex.test(quasi.value.raw)) {
            context.report({
              node: quasi,
              message: 'Hex color codes are not allowed in code.'
            });
          }
        });
      }
    };
  }
};

