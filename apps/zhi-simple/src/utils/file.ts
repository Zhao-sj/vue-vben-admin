import CryptoJS from 'crypto-js';

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

/**
 * 文件分片
 * @param file 文件
 * @param chunkSize 分片大小，默认10M
 */
export function createFileChunks(file: Blob, chunkSize = 1024 * 1024 * 10) {
  if (file.size < chunkSize) {
    return [file];
  }

  const result: Blob[] = [];
  for (let i = 0; i < file.size; i += chunkSize) {
    result.push(file.slice(i, i + chunkSize));
  }
  return result;
}

/**
 * 增量计算文件hash
 * @param chunks 文件分片
 */
export function createFileHash(chunks: Blob[]) {
  return new Promise<string>((resolve) => {
    const sha256 = CryptoJS.algo.SHA256.create();

    async function _read(i: number) {
      if (i >= chunks.length) {
        const hash = sha256.finalize().toString(CryptoJS.enc.Hex);
        resolve(hash);
        return;
      }
      const blob = chunks[i];
      if (blob) {
        const bytes = await blob.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(bytes));
        sha256.update(wordArray);
        _read(i + 1);
      }
    }
    _read(0);
  });
}

/**
 * base64 to blob
 */
export function dataURLtoBlob(base64Buf: string): Blob {
  const arr = base64Buf.split(',') as [string, string];
  const typeItem = arr[0];
  const mime = typeItem.match(/:(.*?);/)?.[1];
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    const cpa = bstr.codePointAt(n);
    if (cpa) {
      u8arr[n] = cpa;
    }
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * img url to base64
 */
export function urlToBase64(url: string, mineType?: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = '';
    img.addEventListener('load', () => {
      let canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.height;
      canvas.width = img.width;
      ctx && ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL(mineType || 'image/png');
      // @ts-ignore memory release, can be ignored
      canvas = null;
      resolve(dataURL);
    });
    img.src = url;
  });
}
