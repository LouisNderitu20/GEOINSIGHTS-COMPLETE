declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';

  declare module 'leaflet' {
    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;

    interface MarkerClusterGroupOptions extends LayerOptions {
      chunkedLoading?: boolean;
      showCoverageOnHover?: boolean;
      zoomToBoundsOnClick?: boolean;
      spiderfyOnMaxZoom?: boolean;
    }

    interface MarkerClusterGroup extends FeatureGroup {
      addLayer(layer: Layer): this;
      clearLayers(): this;
    }
  }

  const MarkerClusterGroup: L.MarkerClusterGroup;
  export = MarkerClusterGroup;
}
