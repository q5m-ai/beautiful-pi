import { useMemo } from "react";
import { Text } from "react-native";
import { tokenizeCode, type SyntaxTokenKind } from "../shared/syntax";

interface HighlightedCodeProps {
  text: string;
  filePath: string;
  colors: Record<SyntaxTokenKind, string>;
}

export function HighlightedCode({ text, filePath, colors }: HighlightedCodeProps) {
  const lines = useMemo(() => tokenizeCode(text, filePath), [filePath, text]);
  const styles = useMemo(
    () => ({
      monospace: { fontFamily: "monospace" },
      plain: { color: colors.plain },
      keyword: { color: colors.keyword },
      string: { color: colors.string },
      number: { color: colors.number },
      comment: { color: colors.comment },
    }),
    [colors.comment, colors.keyword, colors.number, colors.plain, colors.string],
  );

  return (
    <>
      {lines.map((tokens, lineIndex) => (
        <Text key={lineIndex} style={styles.monospace}>
          {lineIndex > 0 ? "\n" : ""}
          {tokens.map((token, tokenIndex) => (
            <Text key={`${tokenIndex}-${token.text}`} style={[styles.monospace, styles[token.kind]]}>{token.text}</Text>
          ))}
        </Text>
      ))}
    </>
  );
}
