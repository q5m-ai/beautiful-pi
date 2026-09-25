export type SyntaxTokenKind = "plain" | "keyword" | "string" | "number" | "comment";

export interface SyntaxToken {
  kind: SyntaxTokenKind;
  text: string;
}

const KEYWORDS: Record<string, true> = {
  as: true, async: true, await: true, break: true, case: true, catch: true, class: true, const: true, continue: true,
  def: true, default: true, do: true, else: true, enum: true, export: true, extends: true, false: true, finally: true,
  for: true, from: true, function: true, if: true, implements: true, import: true, in: true, interface: true, let: true,
  match: true, new: true, null: true, of: true, package: true, pass: true, private: true, protected: true, public: true,
  raise: true, return: true, static: true, super: true, switch: true, throw: true, true: true, try: true, type: true,
  typeof: true, undefined: true, var: true, while: true, with: true, yield: true,
};

const HASH_COMMENT_EXTENSIONS: Record<string, true> = {
  py: true, rb: true, sh: true, bash: true, zsh: true, fish: true, yaml: true, yml: true, toml: true,
};
const DASH_COMMENT_EXTENSIONS: Record<string, true> = { sql: true, lua: true, hs: true };
const BLOCK_COMMENT_EXTENSIONS: Record<string, true> = {
  c: true, cc: true, cpp: true, cs: true, css: true, go: true, java: true, js: true, jsx: true, kt: true,
  rs: true, scss: true, swift: true, ts: true, tsx: true,
};

function appendToken(tokens: SyntaxToken[], kind: SyntaxTokenKind, text: string) {
  if (!text) return;
  const previous = tokens[tokens.length - 1];
  if (previous?.kind === kind) previous.text += text;
  else tokens.push({ kind, text });
}

export function tokenizeCode(code: string, filePath: string): SyntaxToken[][] {
  const extension = filePath.toLowerCase().split(".").pop() ?? "";
  const lineComment = HASH_COMMENT_EXTENSIONS[extension] ? "#" : DASH_COMMENT_EXTENSIONS[extension] ? "--" : "//";
  const supportsBlockComments = Boolean(BLOCK_COMMENT_EXTENSIONS[extension]);
  let inBlockComment = false;

  return code.replace(/\r\n?/g, "\n").split("\n").map((line) => {
    const tokens: SyntaxToken[] = [];
    let index = 0;

    while (index < line.length) {
      if (inBlockComment) {
        const end = line.indexOf("*/", index);
        if (end < 0) {
          appendToken(tokens, "comment", line.slice(index));
          break;
        }
        appendToken(tokens, "comment", line.slice(index, end + 2));
        index = end + 2;
        inBlockComment = false;
        continue;
      }

      if (supportsBlockComments && line.startsWith("/*", index)) {
        const end = line.indexOf("*/", index + 2);
        if (end < 0) {
          appendToken(tokens, "comment", line.slice(index));
          inBlockComment = true;
          break;
        }
        appendToken(tokens, "comment", line.slice(index, end + 2));
        index = end + 2;
        continue;
      }

      if (line.startsWith(lineComment, index)) {
        appendToken(tokens, "comment", line.slice(index));
        break;
      }

      const character = line[index];
      if (character === '"' || character === "'" || character === "`") {
        const quote = character;
        let end = index + 1;
        while (end < line.length) {
          if (line[end] === "\\") end += 2;
          else if (line[end++] === quote) break;
        }
        appendToken(tokens, "string", line.slice(index, end));
        index = end;
        continue;
      }

      const number = line.slice(index).match(/^(?:0x[\da-f]+|\d+(?:\.\d+)?)/i)?.[0];
      if (number) {
        appendToken(tokens, "number", number);
        index += number.length;
        continue;
      }

      const identifier = line.slice(index).match(/^[A-Za-z_$][\w$]*/)?.[0];
      if (identifier) {
        appendToken(tokens, KEYWORDS[identifier] ? "keyword" : "plain", identifier);
        index += identifier.length;
        continue;
      }

      appendToken(tokens, "plain", character);
      index += 1;
    }

    return tokens;
  });
}
