export function downloadTextFile(name: string, content: string, extension: string = 'txt') {
  const file = new Blob(content.split('/n'), { type: 'text/plain' });
  downloadBlobFile(name, extension, file);
}

export function downloadCvsFile(name: string, content: string[]) {
  const file = new Blob(content, { type: 'text/csv' });
  downloadBlobFile(name, 'csv', file);
}

export function downloadBlobFile(name: string, extension: string, content: Blob) {
  const element = document.createElement('a');
  const url = URL.createObjectURL(content);
  element.href = url;
  element.download = name + '.' + extension;
  document.body.appendChild(element);
  element.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(element);
}
