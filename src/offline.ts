import './index.css';
import {probeConnection} from './lib/probeConnection';

const button = document.querySelector<HTMLButtonElement>('#retry')!;
const status = document.getElementById('status')!;

async function retry() {
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = 'Checking connection...';
    status.textContent = '';
    try {
        if (!await probeConnection()) throw new Error('Server unavailable');
        window.location.reload();
    } catch {
        status.textContent = 'Still unable to connect. Check your connection and try again.';
    } finally {
        button.disabled = false;
        button.textContent = 'Retry connection';
    }
}

button.addEventListener('click', retry);
window.addEventListener('online', retry);
