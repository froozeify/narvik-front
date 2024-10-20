import UuidEncoder from "uuid-encoder";

export const getIdFromIri = (iri?: string): string => {
  if (!iri) return "";

  const id = iri.split("/").pop();

  if (!id) {
    return "";
  }

  return id;
};

export function convertUuidToUrlUuid(uuid: string): string {
  const encoder = new UuidEncoder('base36')
  return encoder.encode(uuid)
}

export function decodeUrlUuid(uuid: string): string {
  const encoder = new UuidEncoder('base36')
  return encoder.decode(uuid)
}

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
