import React from "react";

/**
 * Tabela „Zakres badań” (A/NA, metoda, numer punktu, itd.)
 *
 * Props:
 *  - rows: Array<{ id, feature, testNumber, accreditation, methodRef, spec, units }>
 *  - onChange(rows): void
 *  - onAdd(): void
 *  - onRemove(id): void
 */
export default function TestScopeTable({ rows, onChange, onAdd, onRemove }) {
  const update = (id, patch) => {
    const next = rows.map(r => (r.id === id ? { ...r, ...patch } : r));
    onChange(next);
  };

  return (
    <div className="scope">
      <div className="scope__top">
        <div className="docs__legend" style={{flex: "1 1 auto"}}>
          <span className="docs__chip">A = akredytowane (PCA, AB 124)</span>
          <span className="docs__chip">NA = nieakredytowane (zgodne z PN-EN ISO/IEC 17025:2018-02)</span>
          <span className="docs__chip">EN: A = accredited · NA = non-accredited</span>
        </div>
        <button type="button" className="docs__btn docs__btn--primary" onClick={onAdd}>+ Dodaj pozycję</button>
      </div>

      <table className="scope__table">
        <thead>
          <tr>
            <th style={{width: '22%'}}>Badana cecha / <i>Tested feature</i></th>
            <th style={{width: '16%'}}>Nr punktu / <i>Test number</i></th>
            <th style={{width: '12%'}}>A / NA</th>
            <th style={{width: '22%'}}>Metoda / <i>Reference</i></th>
            <th style={{width: '18%'}}>Specyfikacja / <i>Client spec</i></th>
            <th style={{width: '10%'}}>Jedn. / <i>Units</i></th>
            <th style={{width: '10%'}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>
                <input
                  value={row.feature || ""}
                  onChange={e => update(row.id, { feature: e.target.value })}
                  placeholder="np. Zdolność rozruchowa"
                />
              </td>
              <td>
                <input
                  value={row.testNumber || ""}
                  onChange={e => update(row.id, { testNumber: e.target.value })}
                  placeholder="np. 7.3.2"
                />
              </td>
              <td>
                <select
                  value={row.accreditation || "A"}
                  onChange={e => update(row.id, { accreditation: e.target.value })}
                >
                  <option value="A">A — akredytowane</option>
                  <option value="NA">NA — nieakredytowane</option>
                </select>
                <div className={`scope__badge ${row.accreditation === 'NA' ? 'na' : ''}`} style={{marginTop:6}}>
                  {row.accreditation}
                </div>
              </td>
              <td>
                <input
                  value={row.methodRef || ""}
                  onChange={e => update(row.id, { methodRef: e.target.value })}
                  placeholder="np. EN 50395"
                />
                <div className="scope__small">Metoda / <i>Reference document</i></div>
              </td>
              <td>
                <input
                  value={row.spec || ""}
                  onChange={e => update(row.id, { spec: e.target.value })}
                  placeholder="np. zapis klienta / tolerancja"
                />
              </td>
              <td>
                <input
                  value={row.units || ""}
                  onChange={e => update(row.id, { units: e.target.value })}
                  placeholder="np. A, V, °C"
                />
              </td>
              <td>
                <button
                  type="button"
                  className="docs__btn docs__btn--danger"
                  onClick={() => onRemove(row.id)}
                  title="Usuń wiersz"
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div className="scope__note">
                  Dodaj pozycje zakresu badań (A/NA, metoda, numer punktu, itd.).<br/>
                  <b>EN:</b> Add test scope items (A/NA, reference, test number, etc.).
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="scope__note">
        <b>Forma przedstawiania wyników z badań</b> wynika z zastosowanej metody, rodzaju badań lub specyfikacji Zleceniodawcy, z uwzględnieniem wymagań normy PN-EN ISO/IEC 17025:2018-02. <br/>
        <i>EN: The representation of test results depends on test methodology, type of tests or client's specification and the requirements of PN-EN ISO/IEC 17025:2018-02.</i>
      </div>
    </div>
  );
}
