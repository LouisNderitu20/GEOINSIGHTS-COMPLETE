'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="text-center py-5 text-muted">Loading map...</div>,
});

type MarkerPoint = {
  lat: number;
  lng: number;
  label: string;   
  type: string;    
  species: string;
  year: number;
};

export default function MapPage() {
  const [data, setData] = useState<MarkerPoint[]>([]);
  const [filter, setFilter] = useState('');
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [allSpecies, setAllSpecies] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const visibleMarkersRef = useRef<MarkerPoint[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data.length) return;
    const types = Array.from(new Set(data.map(d => d.type)));
    const regions = Array.from(new Set(data.map(d => d.label)));
    const species = Array.from(new Set(data.map(d => d.species)));
    const years = Array.from(new Set(data.map(d => d.year))).sort();

    setAllTypes(types);
    setAllRegions(regions);
    setAllSpecies(species);
    setAllYears(years);

    setSelectedTypes(types); 
  }, [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;

      try {
        let parsed: any[] = [];

        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(result);
        } else if (file.name.endsWith('.csv')) {
          const [headerLine, ...rows] = result.trim().split('\n');
          const headers = headerLine.split(',').map(h => h.trim().toLowerCase());

          const latIndex = headers.indexOf('lat');
          const lngIndex = headers.indexOf('lng');
          const labelIndex = headers.indexOf('label');
          const typeIndex = headers.indexOf('type');
          const speciesIndex = headers.indexOf('species');
          const yearIndex = headers.indexOf('year');

          if ([latIndex, lngIndex, labelIndex, typeIndex, speciesIndex, yearIndex].includes(-1)) {
            throw new Error();
          }

          parsed = rows.map(row => {
            const cols = row.split(',');
            return {
              lat: parseFloat(cols[latIndex]),
              lng: parseFloat(cols[lngIndex]),
              label: cols[labelIndex],
              type: cols[typeIndex],
              species: cols[speciesIndex],
              year: parseInt(cols[yearIndex]),
            };
          });
        }

        const cleaned = parsed.filter(p =>
          typeof p.lat === 'number' &&
          typeof p.lng === 'number' &&
          typeof p.label === 'string' &&
          typeof p.type === 'string' &&
          typeof p.species === 'string' &&
          typeof p.year === 'number'
        );

        setData(cleaned);
      } catch {
        alert('Invalid file. Must include lat, lng, label, type, species, year.');
      }
    };

    reader.readAsText(file);
  };

  const clearData = () => {
    if (!confirm('Clear all uploaded data and filters?')) return;
    setData([]);
    setFilter('');
    setSelectedRegion('');
    setSelectedSpecies('');
    setSelectedYear('');
    setSelectedTypes([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportCSV = () => {
    const rows = visibleMarkersRef.current;
    const csv = ['label,type,species,year,lat,lng']
      .concat(rows.map(p => `${p.label},${p.type},${p.species},${p.year},${p.lat},${p.lng}`))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map_data.csv';
    link.click();
  };

  const exportGeoJSON = () => {
    const features = visibleMarkersRef.current.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        label: p.label,
        type: p.type,
        species: p.species,
        year: p.year,
      },
    }));

    const blob = new Blob([JSON.stringify({ type: 'FeatureCollection', features }, null, 2)], {
      type: 'application/json',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map_data.geojson';
    link.click();
  };

  return (
    <main className="container-fluid py-4">
      <h2 className="fw-bold mb-4 text-heading text-center">Interactive Vector Species Map.</h2>

      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            <option value="">All Regions</option>
            {allRegions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedSpecies} onChange={e => setSelectedSpecies(e.target.value)}>
            <option value="">All Species</option>
            {allSpecies.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            {allYears.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {allTypes.length > 0 && (
        <div className="row mb-3">
          <div className="col">
            <div className="p-3 border rounded bg-light shadow-sm">
              <strong className="d-block mb-2">Filter by Type:</strong>
              <div className="d-flex flex-wrap gap-3">
                {allTypes.map((type) => (
                  <label
                    key={type}
                    className={`badge rounded-pill px-3 py-2 text-bg-${selectedTypes.includes(type) ? 'primary' : 'secondary'}`}
                    style={{ cursor: 'pointer' }}
                    htmlFor={`filter-${type}`}
                  >
                    <input
                      className="d-none"
                      type="checkbox"
                      id={`filter-${type}`}
                      checked={selectedTypes.includes(type)}
                      onChange={() =>
                        setSelectedTypes(prev =>
                          prev.includes(type)
                            ? prev.filter(t => t !== type)
                            : [...prev, type]
                        )
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4 align-items-center g-2">
        <div className="col-md-4">
          <input
            type="file"
            accept=".json,.csv"
            className="form-control"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <small className="text-muted d-block mt-2">
            CSV Format Required: <code>lat,lng,label,type,species,year</code>
         </small>
        </div>
        <div className="col-md-8 text-end">
          <button className="btn btn-outline-secondary me-2" onClick={clearData}>
            <i className="fas fa-times me-1"></i> Clear
          </button>
          <button className="btn btn-outline-primary me-2" onClick={exportCSV}>
            <i className="fas fa-file-csv me-1"></i> Export CSV
          </button>
          <button className="btn btn-outline-success" onClick={exportGeoJSON}>
            <i className="fas fa-download me-1"></i> Export GeoJSON
          </button>
        </div>
      </div>

      <div className="rounded shadow-sm overflow-hidden" style={{ width: '100%', height: '600px' }}>
        <MapDisplay
          filter={filter}
          data={data}
          visibleRef={visibleMarkersRef}
          selectedTypes={selectedTypes}
          selectedRegion={selectedRegion}
          selectedSpecies={selectedSpecies}
          selectedYear={selectedYear}
        />
      </div>
    </main>
  );
}
