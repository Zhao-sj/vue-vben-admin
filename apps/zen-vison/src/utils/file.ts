export function download(data: Blob, fileName: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(data: Blob, fileName: string) {
  download(data, fileName, 'application/vnd.ms-excel');
}

export function downloadWord(data: Blob, fileName: string) {
  download(data, fileName, 'application/msword');
}

export function downloadZip(data: Blob, fileName: string) {
  download(data, fileName, 'application/zip');
}

export function downloadHtml(data: Blob, fileName: string) {
  download(data, fileName, 'text/html');
}

export function downloadMarkdown(data: Blob, fileName: string) {
  download(data, fileName, 'text/markdown');
}
