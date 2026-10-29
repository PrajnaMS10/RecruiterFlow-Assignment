import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(cleanup);

// jsdom does not implement native modal dialog methods; real-browser checks cover them.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); this.querySelector<HTMLButtonElement>('button')?.focus(); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
