import React from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

// Pobierz szablon z /public/templates (bez ?arraybuffer)
async function fetchTemplateArrayBuffer(path = '/templates/wzor_placeholdery.docx') {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Nie mogę pobrać szablonu DOCX');
  const blob = await res.blob();
  return await blob.arrayBuffer();
}

/**
 * Prosty generator pojedynczych kart na bazie danych wejściowych.
 * Zostawia Twoje klasy i prostotę użycia.
 */
export default function OvertimeDocGenerator({ data = [], templatePath = '/templates/wzor_placeholdery.docx' }) {
  const generateDocuments = async () => {
    let templateAB;
    try {
      templateAB = await fetchTemplateArrayBuffer(templatePath);
    } catch (err) {
      console.error('Błąd pobierania szablonu:', err);
      alert('Nie udało się pobrać szablonu.');
      return;
    }

    for (const entry of data) {
      try {
        const zip = new PizZip(templateAB);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '[[', end: ']]' } });

        doc.setData({
          name: entry.name,
          date: entry.date,
          hours: entry.hours,
          company: entry.company || 'EXIDE',
        });

        doc.render();

        const out = doc.getZip().generate({ type: 'blob' });
        saveAs(out, `karta_nadgodzin_${entry.name}_${entry.date}.docx`);
      } catch (error) {
        console.error('Błąd podczas renderowania dokumentu:', error);
        alert(`Nie udało się wygenerować dokumentu dla: ${entry.name}`);
        return;
      }
    }
  };

  return (
    <button className="btn btn--primary" onClick={generateDocuments}>
      Generuj karty DOCX
    </button>
  );
}
