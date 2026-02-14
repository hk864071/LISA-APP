import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.version = '';
