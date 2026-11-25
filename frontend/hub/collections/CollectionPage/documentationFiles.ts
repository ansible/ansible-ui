export type DocumentationFile = {
  name: string;
  html: string;
};

export function getDocumentationRouteName(fileName: string) {
  return fileName.replace('.md', '');
}

export function findDocumentationFile(
  files: DocumentationFile[] | undefined,
  routeName: string
): DocumentationFile | undefined {
  return files?.find((file) => getDocumentationRouteName(file.name) === routeName);
}
