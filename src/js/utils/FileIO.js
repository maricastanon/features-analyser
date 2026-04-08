/* ═══════════════════════════════════════════════════════════════
   FileIO — File reading, drag-drop handling
   ═══════════════════════════════════════════════════════════════ */
const FileIO = {
  async readTextFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.text();
  },

  // Read a File object as text
  readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  // Read a File object as data URL (for image/reference previews)
  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },

  async readFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
    const content = imageExts.includes(ext)
      ? await this.readAsDataURL(file)
      : await this.readAsText(file);

    return { name: file.name, content, ext, size: file.size };
  },

  // Read multiple files, classify by extension
  async readFiles(fileList) {
    const result = {
      js: [],
      css: [],
      py: [],
      html: [],
      md: [],
      text: [],
      json: [],
      svg: [],
      images: [],
      other: []
    };

    for (const file of fileList) {
      const entry = await this.readFile(file);
      const { ext } = entry;

      if (ext === 'js') result.js.push(entry);
      else if (ext === 'css') result.css.push(entry);
      else if (ext === 'py') result.py.push(entry);
      else if (ext === 'html' || ext === 'htm') result.html.push(entry);
      else if (ext === 'md' || ext === 'markdown' || ext === 'mmd') result.md.push(entry);
      else if (ext === 'txt' || ext === 'csv') result.text.push(entry);
      else if (ext === 'json') result.json.push(entry);
      else if (ext === 'svg') result.svg.push(entry);
      else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) result.images.push(entry);
      else result.other.push(entry);
    }
    return result;
  },

  // Setup drag-drop zone
  setupDropZone(element, onDrop) {
    element.addEventListener('dragover', e => {
      e.preventDefault();
      element.classList.add('dragover');
    });
    element.addEventListener('dragleave', () => {
      element.classList.remove('dragover');
    });
    element.addEventListener('drop', async e => {
      e.preventDefault();
      element.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        const files = await this.readFiles(e.dataTransfer.files);
        onDrop(files);
      }
    });
  },

  // Download as zip (simple implementation — 2 files)
  downloadBundle(files) {
    // For simplicity: download files individually with slight delay
    files.forEach((f, i) => {
      setTimeout(() => DOM.download(f.name, f.content), i * 300);
    });
  }
};
