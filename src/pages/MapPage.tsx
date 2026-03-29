import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pencil, Satellite, Maximize, X } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import StatusBadge from '@/components/ui/StatusBadge';
import MobileNav from '@/components/layout/MobileNav';
import { useSites, useProjects } from '@/hooks/useApi';
import api from '@/services/api';
import 'maplibre-gl/dist/maplibre-gl.css';

/* ——— Free basemap styles (no token required) ——— */
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_SATELLITE =
  'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json';

const DEFAULT_CENTER: [number, number] = [20, 10];
const DEFAULT_ZOOM = 1.8;

const typeColors: Record<string, string> = {
  Carbon: '#4ade80',
  Biodiversity: '#60a5fa',
  Mixed: '#a78bfa',
};

/* ─── Lightweight polygon draw state machine ─── */
interface DrawState {
  active: boolean;
  points: [number, number][];
}

const MapPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedSite, setSelectedSite] = useState<string | number | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [newSitePolygon, setNewSitePolygon] = useState<unknown>(null);
  const [newSiteData, setNewSiteData] = useState({ name: '', project_id: '', type: 'Carbon' });
  const [mapReady, setMapReady] = useState(false);
  const [drawState, setDrawState] = useState<DrawState>({ active: false, points: [] });
  const drawStateRef = useRef(drawState);
  drawStateRef.current = drawState;

  const { data: rawSites = [], refetch: refetchSites } = useSites();
  const { data: rawProjects = [] } = useProjects();

  // Merge sites with project names and compute center coordinates
  const sites = useMemo(() => {
    return rawSites.map(s => {
      const proj = rawProjects.find(p => p.id === s.project_id);
      let coords: [number, number] = [0, 0];
      if (s.polygon_geojson && s.polygon_geojson.coordinates) {
        const ring = s.polygon_geojson.coordinates[0] as [number, number][];
        coords = ring[0] || [0, 0];
      }
      return { ...s, projectName: proj ? proj.name : 'Unknown', coordinates: coords };
    });
  }, [rawSites, rawProjects]);

  // Apply search + type filter
  const filtered = sites.filter(s => {
    if (
      search &&
      !s.name.toLowerCase().includes(search.toLowerCase()) &&
      !(s.projectName || '').toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filter !== 'All' && s.type !== filter) return false;
    return true;
  });

  // GeoJSON collection for all site polygons
  const featureCollection: GeoJSON.FeatureCollection = useMemo(() => {
    const features: GeoJSON.Feature[] = sites
      .filter(s => s.polygon_geojson && s.polygon_geojson.type === 'Polygon')
      .map(s => ({
        type: 'Feature' as const,
        geometry: s.polygon_geojson as GeoJSON.Geometry,
        properties: { id: s.id, name: s.name, type: s.type || 'Carbon' },
      }));
    return { type: 'FeatureCollection' as const, features };
  }, [sites]);

  /* ─────────── Initialise map ─────────── */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_LIGHT,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Click handler for draw mode — fires BEFORE layer-specific handlers
    map.on('click', e => {
      const ds = drawStateRef.current;
      if (!ds.active) return;
      // Prevent the click from reaching the sites-fill layer
      e.preventDefault();
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setDrawState(prev => ({ ...prev, points: [...prev.points, pt] }));
    });

    // Double-click completes polygon
    map.on('dblclick', e => {
      const ds = drawStateRef.current;
      if (!ds.active || ds.points.length < 3) return;
      e.preventDefault();

      const closed = [...ds.points, ds.points[0]];
      const geojson = { type: 'Polygon', coordinates: [closed] };
      setNewSitePolygon(geojson);
      setDrawState({ active: false, points: [] });
      setShowNewSiteModal(true);

      // Remove draw preview layer
      if (map.getLayer('draw-preview-line')) map.removeLayer('draw-preview-line');
      if (map.getLayer('draw-preview-fill')) map.removeLayer('draw-preview-fill');
      if (map.getLayer('draw-preview-points')) map.removeLayer('draw-preview-points');
      if (map.getSource('draw-preview')) map.removeSource('draw-preview');
    });

    map.on('load', () => setMapReady(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Draw preview layer ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (drawState.points.length === 0) {
      if (map.getLayer('draw-preview-line')) map.removeLayer('draw-preview-line');
      if (map.getLayer('draw-preview-fill')) map.removeLayer('draw-preview-fill');
      if (map.getLayer('draw-preview-points')) map.removeLayer('draw-preview-points');
      if (map.getSource('draw-preview')) map.removeSource('draw-preview');
      return;
    }

    const coords = drawState.points;
    const closed = coords.length >= 3 ? [...coords, coords[0]] : coords;

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry:
            coords.length >= 3
              ? { type: 'Polygon', coordinates: [closed] }
              : { type: 'LineString', coordinates: coords },
          properties: {},
        },
        ...coords.map(
          c =>
            ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: c },
              properties: {},
            }) as GeoJSON.Feature,
        ),
      ],
    };

    if (map.getSource('draw-preview')) {
      (map.getSource('draw-preview') as maplibregl.GeoJSONSource).setData(geojsonData);
    } else {
      map.addSource('draw-preview', { type: 'geojson', data: geojsonData });

      if (coords.length >= 3) {
        map.addLayer({
          id: 'draw-preview-fill',
          type: 'fill',
          source: 'draw-preview',
          paint: { 'fill-color': '#4ade80', 'fill-opacity': 0.15 },
          filter: ['==', '$type', 'Polygon'],
        });
      }

      map.addLayer({
        id: 'draw-preview-line',
        type: 'line',
        source: 'draw-preview',
        paint: { 'line-color': '#4ade80', 'line-width': 2, 'line-dasharray': [3, 2] },
        filter: ['in', '$type', 'LineString', 'Polygon'],
      });

      map.addLayer({
        id: 'draw-preview-points',
        type: 'circle',
        source: 'draw-preview',
        paint: {
          'circle-radius': 5,
          'circle-color': '#4ade80',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
        filter: ['==', '$type', 'Point'],
      });
    }
  }, [drawState.points, mapReady]);

  /* ─── Toggle satellite style ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.setStyle(isSatellite ? STYLE_SATELLITE : STYLE_LIGHT);
    map.once('styledata', () => addSiteLayer(map, featureCollection));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSatellite]);

  /* ─── Render site polygons ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    addSiteLayer(map, featureCollection);

    if (featureCollection.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      featureCollection.features.forEach(f => {
        if (f.geometry.type === 'Polygon') {
          (f.geometry.coordinates[0] as [number, number][]).forEach(c => bounds.extend(c));
        }
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 6 });
    }
  }, [featureCollection, mapReady]);

  function addSiteLayer(map: maplibregl.Map, fc: GeoJSON.FeatureCollection) {
    if (map.getLayer('sites-fill')) map.removeLayer('sites-fill');
    if (map.getLayer('sites-outline')) map.removeLayer('sites-outline');
    if (map.getSource('sites')) map.removeSource('sites');

    map.addSource('sites', { type: 'geojson', data: fc });

    map.addLayer({
      id: 'sites-fill',
      type: 'fill',
      source: 'sites',
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'Carbon',
          typeColors.Carbon,
          'Biodiversity',
          typeColors.Biodiversity,
          'Mixed',
          typeColors.Mixed,
          typeColors.Carbon,
        ],
        'fill-opacity': 0.25,
      },
    });

    map.addLayer({
      id: 'sites-outline',
      type: 'line',
      source: 'sites',
      paint: {
        'line-color': [
          'match',
          ['get', 'type'],
          'Carbon',
          typeColors.Carbon,
          'Biodiversity',
          typeColors.Biodiversity,
          'Mixed',
          typeColors.Mixed,
          typeColors.Carbon,
        ],
        'line-width': 2,
      },
    });

    map.on('click', 'sites-fill', e => {
      // Ignore site clicks while in draw mode
      if (drawStateRef.current.active) return;
      if (e.features && e.features.length > 0) {
        const id = e.features[0].properties?.id;
        if (id !== undefined) setSelectedSite(id);
      }
    });

    map.on('mouseenter', 'sites-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'sites-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  }

  const flyTo = (coords: [number, number]) => {
    mapRef.current?.flyTo({ center: coords, zoom: 6, duration: 1500 });
  };

  const handleCreateSite = async () => {
    try {
      await api.post('/sites/', {
        name: newSiteData.name,
        project_id: parseInt(newSiteData.project_id),
        type: newSiteData.type,
        area: 100,
        polygon_geojson: newSitePolygon,
      });
      setShowNewSiteModal(false);
      setNewSiteData({ name: '', project_id: '', type: 'Carbon' });
      refetchSites();
    } catch (e) {
      console.error(e);
    }
  };

  const startDraw = () => {
    setDrawState({ active: true, points: [] });
    setSelectedSite(null);
    const map = mapRef.current;
    if (map) {
      map.getCanvas().style.cursor = 'crosshair';
      map.doubleClickZoom.disable();
    }
  };

  const finishDraw = () => {
    const ds = drawStateRef.current;
    if (ds.points.length < 3) return;
    const closed = [...ds.points, ds.points[0]];
    const geojson = { type: 'Polygon', coordinates: [closed] };
    setNewSitePolygon(geojson);
    setDrawState({ active: false, points: [] });
    setShowNewSiteModal(true);
    const map = mapRef.current;
    if (map) {
      map.getCanvas().style.cursor = '';
      map.doubleClickZoom.enable();
      if (map.getLayer('draw-preview-line')) map.removeLayer('draw-preview-line');
      if (map.getLayer('draw-preview-fill')) map.removeLayer('draw-preview-fill');
      if (map.getLayer('draw-preview-points')) map.removeLayer('draw-preview-points');
      if (map.getSource('draw-preview')) map.removeSource('draw-preview');
    }
  };

  const cancelDraw = () => {
    setDrawState({ active: false, points: [] });
    const map = mapRef.current;
    if (map) {
      map.getCanvas().style.cursor = '';
      map.doubleClickZoom.enable();
      if (map.getLayer('draw-preview-line')) map.removeLayer('draw-preview-line');
      if (map.getLayer('draw-preview-fill')) map.removeLayer('draw-preview-fill');
      if (map.getLayer('draw-preview-points')) map.removeLayer('draw-preview-points');
      if (map.getSource('draw-preview')) map.removeSource('draw-preview');
    }
  };

  const selected = sites.find(s => String(s.id) === String(selectedSite));

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-background">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Float Left Panel — site list */}
      <div className="absolute top-0 left-0 h-full w-80 z-[1000] overflow-hidden hidden md:flex flex-col bg-background/90 backdrop-blur-md border-r">
        <div className="p-4 border-b">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search sites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg text-sm bg-background/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            {['All', 'Carbon', 'Biodiversity', 'Mixed'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${filter === t ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filtered.map(site => (
            <button
              key={site.id}
              onClick={() => {
                setSelectedSite(site.id);
                flyTo(site.coordinates);
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${selectedSite === site.id ? 'bg-primary/[0.06]' : 'hover:bg-muted/50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: typeColors[site.type || 'Carbon'] }}
                />
                <span className="text-sm font-medium text-foreground">{site.name}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-4">{site.projectName}</div>
              <div className="flex gap-3 mt-1 ml-4 text-xs text-muted-foreground">
                <span>{(site.area || 0).toLocaleString()} ha</span>
                <span>Score: {site.carbon_score}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Draw mode banner */}
      {drawState.active && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-3 shadow-lg">
          <Pencil className="w-4 h-4" />
          <span>Click to add points ({drawState.points.length} pts)</span>
          {drawState.points.length >= 3 && (
            <button
              onClick={finishDraw}
              className="px-3 py-1 rounded-md bg-white text-primary text-xs font-bold hover:bg-white/90 transition-colors"
            >
              ✓ Finish & Save
            </button>
          )}
          <button onClick={cancelDraw} className="underline text-primary-foreground/80 text-xs">
            Cancel
          </button>
        </div>
      )}

      {/* Floating Toolbar */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {[
          { icon: Pencil, label: 'Draw Site' },
          { icon: Satellite, label: 'Satellite' },
          { icon: Maximize, label: 'Zoom to All' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
              label === 'Draw Site' && drawState.active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              if (label === 'Zoom to All') {
                mapRef.current?.flyTo({
                  center: DEFAULT_CENTER,
                  zoom: DEFAULT_ZOOM,
                  duration: 1500,
                });
              }
              if (label === 'Draw Site') {
                if (drawState.active) cancelDraw();
                else startDraw();
              }
              if (label === 'Satellite') {
                setIsSatellite(v => !v);
              }
            }}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Site Detail Popup */}
      {selected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-[360px] md:translate-x-0 z-[1001] w-[320px] rounded-xl p-5 elevated-shadow animate-fade-in bg-card border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{selected.name}</h3>
              <StatusBadge status={selected.type || 'Carbon'}>
                {selected.projectName}
              </StatusBadge>
            </div>
            <button
              onClick={() => setSelectedSite(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <div className="text-label text-muted-foreground">Area</div>
              <div className="text-sm font-semibold text-foreground">
                {selected.area.toLocaleString()} ha
              </div>
            </div>
            <div>
              <div className="text-label text-muted-foreground">Carbon</div>
              <div className="text-sm font-semibold text-foreground">{selected.carbon_score}</div>
            </div>
            <div>
              <div className="text-label text-muted-foreground">Biodiversity</div>
              <div className="text-sm font-semibold text-foreground">
                {selected.biodiversity_score}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/sites/${selected.id}`)}
            className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
          >
            View Full Analytics →
          </button>
        </div>
      )}

      {/* New Site Modal */}
      {showNewSiteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowNewSiteModal(false)}
        >
          <div
            className="w-full max-w-[400px] mx-4 rounded-xl p-6 bg-card elevated-shadow border"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Save New Site</h3>
              <button
                onClick={() => setShowNewSiteModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Site Name
                </label>
                <input
                  value={newSiteData.name}
                  onChange={e => setNewSiteData({ ...newSiteData, name: e.target.value })}
                  placeholder="e.g., Borneo Zone A"
                  className="w-full h-9 px-3 rounded-lg text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Assign to Project
                </label>
                <select
                  value={newSiteData.project_id}
                  onChange={e => setNewSiteData({ ...newSiteData, project_id: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-background border text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                >
                  <option value="" disabled>
                    Select project...
                  </option>
                  {rawProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Ecosystem Type
                </label>
                <select
                  value={newSiteData.type}
                  onChange={e => setNewSiteData({ ...newSiteData, type: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-background border text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                >
                  <option value="Carbon">Carbon</option>
                  <option value="Biodiversity">Biodiversity</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewSiteModal(false)}
                className="h-9 px-4 rounded-lg text-sm font-medium text-muted-foreground border hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSite}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
              >
                Save Site
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};

export default MapPage;
