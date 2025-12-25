// Uren module
import { db } from '../utils/database';
import { showModal, closeModal, showAlert, formatDate } from '../utils/ui';
import type { Uren } from '../types';

export async function loadUren(): Promise<void> {
  const werknemerId = (document.getElementById('uren-werknemer') as HTMLSelectElement)?.value;
  const maand = (document.getElementById('uren-maand') as HTMLInputElement)?.value;
  const list = document.getElementById('uren-list');
  
  if (!list || !werknemerId || !maand) {
    if (list) list.innerHTML = '<div class="empty-state"><p>Selecteer een werknemer en maand</p></div>';
    return;
  }

  const allUren = await db.getUren();
  const [year, month] = maand.split('-');

  const filtered = allUren.filter(u => {
    const date = new Date(u.datum);
    return u.werknemerId === werknemerId && 
           date.getFullYear() == parseInt(year) && 
           date.getMonth() + 1 == parseInt(month);
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Geen uren gevonden voor deze periode</p></div>';
    return;
  }

  let html = '<table><thead><tr><th>Datum</th><th>Uren</th><th>Opmerking</th><th>Acties</th></tr></thead><tbody>';

  filtered.forEach(u => {
    const date = new Date(u.datum);
    html += `<tr>
      <td>${formatDate(date)}</td>
      <td>${u.uren}</td>
      <td>${u.opmerking || '-'}</td>
      <td><button class="btn btn-danger" onclick="window.urenModule.deleteUren('${u.id}')">Verwijderen</button></td>
    </tr>`;
  });

  html += '</tbody></table>';
  list.innerHTML = html;
}

export function addUren(): void {
  const html = `
    <h2>Uren Toevoegen</h2>
    <form onsubmit="window.urenModule.saveUren(event)">
      <div class="form-group">
        <label>Datum *</label>
        <input type="date" id="uren-datum" required>
      </div>
      <div class="form-group">
        <label>Aantal uren *</label>
        <input type="number" id="uren-aantal" value="8" min="0" step="0.5" required>
      </div>
      <div class="form-group">
        <label>Opmerking</label>
        <textarea id="uren-opmerking" rows="3"></textarea>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-primary">Opslaan</button>
        <button type="button" class="btn" onclick="window.uiModule.closeModal()">Annuleren</button>
      </div>
    </form>
  `;
  showModal(html);
}

export async function saveUren(e: Event): Promise<void> {
  e.preventDefault();
  const werknemerId = (document.getElementById('uren-werknemer') as HTMLSelectElement)?.value;
  const datum = (document.getElementById('uren-datum') as HTMLInputElement)?.value;
  const uren = parseFloat((document.getElementById('uren-aantal') as HTMLInputElement)?.value || '0');
  const opmerking = (document.getElementById('uren-opmerking') as HTMLTextAreaElement)?.value || null;

  if (!werknemerId || !datum) return;

  await db.add<Uren>('uren', {
    werknemerId,
    datum: new Date(datum).toISOString(),
    uren,
    opmerking
  });

  closeModal();
  showAlert('Uren toegevoegd!', 'success');
  await loadUren();
}

export async function deleteUren(id: string): Promise<void> {
  if (!confirm('Weet u zeker dat u deze urenregistratie wilt verwijderen?')) return;
  await db.delete('uren', id);
  showAlert('Uren verwijderd!', 'success');
  await loadUren();
}

export async function loadWerknemerSelect(selectId: string): Promise<void> {
  try {
    const werknemers = await db.getWerknemers();
    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (!select) return;

    const filteredWerknemers = werknemers.filter(w => w.actief !== false);
    select.innerHTML = '<option value="">-- Selecteer werknemer --</option>';
    
    filteredWerknemers.forEach(w => {
      select.innerHTML += `<option value="${w.id}">${w.naam}</option>`;
    });
  } catch (error) {
    console.error('Error loading werknemers:', error);
  }
}

export async function reloadSelects(): Promise<void> {
  await loadWerknemerSelect('uren-werknemer');
}

declare global {
  interface Window {
    urenModule: typeof import('./uren');
  }
}

