// Werknemers module
import { db } from '../utils/database';
import { showModal, closeModal, showAlert } from '../utils/ui';
import type { Werknemer } from '../types';

let editingId: string | null = null;

export async function loadWerknemers(): Promise<void> {
  const werknemers = await db.getWerknemers();
  const list = document.getElementById('werknemers-list');
  if (!list) return;

  if (werknemers.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Geen werknemers gevonden. Voeg er een toe!</p></div>';
    return;
  }

  let html = '<table><thead><tr><th>Naam</th><th>Email</th><th>Nummerplaat</th><th>Status</th><th>Acties</th></tr></thead><tbody>';

  werknemers.forEach(w => {
    html += `<tr>
      <td>${w.naam || ''}</td>
      <td>${w.email || '-'}</td>
      <td>${w.nummerplaat || '-'}</td>
      <td>${w.actief !== false ? '<span style="color: green;">Actief</span>' : '<span style="color: red;">Inactief</span>'}</td>
      <td>
        <button class="btn btn-primary" onclick="window.werknemersModule.editWerknemer('${w.id}')">Bewerken</button>
        <button class="btn btn-danger" onclick="window.werknemersModule.deleteWerknemer('${w.id}')">Verwijderen</button>
      </td>
    </tr>`;
  });

  html += '</tbody></table>';
  list.innerHTML = html;
}

export function addWerknemer(): void {
  editingId = null;
  const html = `
    <h2>Werknemer Toevoegen</h2>
    <form onsubmit="window.werknemersModule.saveWerknemer(event)">
      <div class="form-group">
        <label>Naam *</label>
        <input type="text" id="wn-naam" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="wn-email">
      </div>
      <div class="form-group">
        <label>Nummerplaat</label>
        <input type="text" id="wn-nummerplaat">
      </div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-primary">Opslaan</button>
        <button type="button" class="btn" onclick="window.uiModule.closeModal()">Annuleren</button>
      </div>
    </form>
  `;
  showModal(html);
}

export async function editWerknemer(id: string): Promise<void> {
  editingId = id;
  const werknemers = await db.getWerknemers();
  const w = werknemers.find(w => w.id === id);
  if (!w) return;

  const html = `
    <h2>Werknemer Bewerken</h2>
    <form onsubmit="window.werknemersModule.saveWerknemer(event)">
      <div class="form-group">
        <label>Naam *</label>
        <input type="text" id="wn-naam" value="${w.naam || ''}" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="wn-email" value="${w.email || ''}">
      </div>
      <div class="form-group">
        <label>Nummerplaat</label>
        <input type="text" id="wn-nummerplaat" value="${w.nummerplaat || ''}">
      </div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-primary">Opslaan</button>
        <button type="button" class="btn" onclick="window.uiModule.closeModal()">Annuleren</button>
      </div>
    </form>
  `;
  showModal(html);
}

export async function saveWerknemer(e: Event): Promise<void> {
  e.preventDefault();
  const naam = (document.getElementById('wn-naam') as HTMLInputElement)?.value;
  const email = (document.getElementById('wn-email') as HTMLInputElement)?.value || null;
  const nummerplaat = (document.getElementById('wn-nummerplaat') as HTMLInputElement)?.value || null;

  if (!naam) return;

  const data: Partial<Werknemer> = { naam, email, nummerplaat, actief: true };

  if (editingId) {
    await db.update<Werknemer>('werknemers', editingId, data);
    showAlert('Werknemer bijgewerkt!', 'success');
  } else {
    await db.add<Werknemer>('werknemers', data);
    showAlert('Werknemer toegevoegd!', 'success');
  }

  closeModal();
  await loadWerknemers();
  // Reload selects in other modules
  if (window.urenModule) await window.urenModule.reloadSelects?.();
  if (window.kilometersModule) await window.kilometersModule.reloadSelects?.();
}

export async function deleteWerknemer(id: string): Promise<void> {
  if (!confirm('Weet u zeker dat u deze werknemer wilt verwijderen?')) return;
  await db.delete('werknemers', id);
  showAlert('Werknemer verwijderd!', 'success');
  await loadWerknemers();
}

// Export for global access
declare global {
  interface Window {
    werknemersModule: typeof import('./werknemers');
  }
}

