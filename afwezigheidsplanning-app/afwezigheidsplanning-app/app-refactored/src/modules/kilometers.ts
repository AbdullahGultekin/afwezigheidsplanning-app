// Kilometers module
import { db } from '../utils/database';
import { showModal, closeModal, showAlert, formatDate } from '../utils/ui';
import type { Kilometer, Werknemer } from '../types';

export async function loadKilometers(): Promise<void> {
  const werknemerId = (document.getElementById('kilometers-werknemer') as HTMLSelectElement)?.value;
  const maand = (document.getElementById('kilometers-maand') as HTMLInputElement)?.value;
  const list = document.getElementById('kilometers-list');
  
  if (!list) return;

  if (!werknemerId || !maand) {
    list.innerHTML = '<div class="empty-state"><p>Selecteer een werknemer en maand</p></div>';
    return;
  }

  // Check if selected werknemer has nummerplaat (koerier)
  const werknemers = await db.getWerknemers();
  const selectedWerknemer = werknemers.find(w => w.id === werknemerId);

  if (selectedWerknemer && !selectedWerknemer.nummerplaat) {
    list.innerHTML = '<div class="empty-state"><p>Deze werknemer heeft geen nummerplaat. Alleen koeriers kunnen kilometers registreren.</p></div>';
    return;
  }

  const allKm = await db.getKilometers();
  const [year, month] = maand.split('-');

  const filtered = allKm.filter(k => {
    const date = new Date(k.datum);
    return k.werknemerId === werknemerId && 
           date.getFullYear() == parseInt(year) && 
           date.getMonth() + 1 == parseInt(month);
  }).sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Geen kilometers gevonden voor deze periode</p></div>';
    return;
  }

  let html = '<table><thead><tr><th>Datum</th><th>Kilometers</th><th>Van</th><th>Naar</th><th>Doel</th><th>Acties</th></tr></thead><tbody>';

  filtered.forEach(k => {
    const date = new Date(k.datum);
    html += `<tr>
      <td>${formatDate(date)}</td>
      <td>${k.kilometers}</td>
      <td>${k.vanAdres || '-'}</td>
      <td>${k.naarAdres || '-'}</td>
      <td>${k.doel || '-'}</td>
      <td><button class="btn btn-danger" onclick="window.kilometersModule.deleteKilometer('${k.id}')">Verwijderen</button></td>
    </tr>`;
  });

  html += '</tbody></table>';
  list.innerHTML = html;
}

export async function addKilometer(): Promise<void> {
  const werknemerId = (document.getElementById('kilometers-werknemer') as HTMLSelectElement)?.value;
  if (!werknemerId) {
    showAlert('Selecteer eerst een werknemer', 'error');
    return;
  }

  const werknemers = await db.getWerknemers();
  const selectedWerknemer = werknemers.find(w => w.id === werknemerId);

  if (!selectedWerknemer || !selectedWerknemer.nummerplaat || selectedWerknemer.nummerplaat.trim() === '') {
    showAlert('Alleen koeriers (met nummerplaat) kunnen kilometers registreren. Voeg eerst een nummerplaat toe aan deze werknemer.', 'error');
    return;
  }

  const html = `
    <h2>Kilometers Toevoegen</h2>
    <form onsubmit="window.kilometersModule.saveKilometer(event)">
      <div class="form-group">
        <label>Datum *</label>
        <input type="date" id="km-datum" required>
      </div>
      <div class="form-group">
        <label>Aantal kilometers *</label>
        <input type="number" id="km-aantal" min="0" step="0.1" required>
      </div>
      <div class="form-group">
        <label>Van Adres</label>
        <input type="text" id="km-van">
      </div>
      <div class="form-group">
        <label>Naar Adres</label>
        <input type="text" id="km-naar">
      </div>
      <div class="form-group">
        <label>Doel</label>
        <input type="text" id="km-doel">
      </div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-primary">Opslaan</button>
        <button type="button" class="btn" onclick="window.uiModule.closeModal()">Annuleren</button>
      </div>
    </form>
  `;
  showModal(html);
}

export async function saveKilometer(e: Event): Promise<void> {
  e.preventDefault();
  const werknemerId = (document.getElementById('kilometers-werknemer') as HTMLSelectElement)?.value;
  const datum = (document.getElementById('km-datum') as HTMLInputElement)?.value;
  const kilometers = parseFloat((document.getElementById('km-aantal') as HTMLInputElement)?.value || '0');
  const vanAdres = (document.getElementById('km-van') as HTMLInputElement)?.value || null;
  const naarAdres = (document.getElementById('km-naar') as HTMLInputElement)?.value || null;
  const doel = (document.getElementById('km-doel') as HTMLInputElement)?.value || null;

  if (!werknemerId || !datum) return;

  await db.add<Kilometer>('kilometers', {
    werknemerId,
    datum: new Date(datum).toISOString(),
    kilometers,
    vanAdres,
    naarAdres,
    doel
  });

  closeModal();
  showAlert('Kilometers toegevoegd!', 'success');
  await loadKilometers();
}

export async function deleteKilometer(id: string): Promise<void> {
  if (!confirm('Weet u zeker dat u deze kilometerregistratie wilt verwijderen?')) return;
  await db.delete('kilometers', id);
  showAlert('Kilometers verwijderd!', 'success');
  await loadKilometers();
}

export async function loadWerknemerSelect(selectId: string): Promise<void> {
  try {
    const werknemers = await db.getWerknemers();
    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (!select) return;

    const filteredWerknemers = werknemers.filter(w => w.actief !== false && w.nummerplaat);
    select.innerHTML = '<option value="">-- Selecteer werknemer --</option>';
    
    filteredWerknemers.forEach(w => {
      const displayName = w.nummerplaat ? `${w.naam} (${w.nummerplaat})` : w.naam;
      select.innerHTML += `<option value="${w.id}">${displayName}</option>`;
    });
  } catch (error) {
    console.error('Error loading werknemers:', error);
  }
}

export async function reloadSelects(): Promise<void> {
  await loadWerknemerSelect('kilometers-werknemer');
}

declare global {
  interface Window {
    kilometersModule: typeof import('./kilometers');
  }
}

