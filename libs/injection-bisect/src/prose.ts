const PROSE = /\s|[^ -~]/u;

const looksLikeProse = (text: string): boolean => PROSE.test(text);

export { looksLikeProse };
