export const getIdFromIri = (iri?: string): string => {
  if (!iri) return "";

  const id = iri.split("/").pop();

  if (!id) {
    return "";
  }

  return id;
};

export function pathsMatch(paths: string[], path: string): boolean {
  let pathMatched = false;
  paths.forEach(allowedPath => {
    const result = path.match(new RegExp(allowedPath));
    if (result) {
      pathMatched = true;
      return;
    }
  });
  return pathMatched;
}
