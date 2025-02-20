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
        if (node.loc.start.line === node.loc.end.line) return;

        // Get the closing curly brace.
        const closingBrace = sourceCode.getLastToken(node);
        if (!closingBrace) return;

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

export default blankLineAfterClosing;
