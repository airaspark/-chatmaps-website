/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare namespace google {
  export namespace maps {
    export class Map {
      constructor(mapDiv: HTMLElement, opts?: any);
      panTo(latLng: { lat: number; lng: number }): void;
      setZoom(zoom: number): void;
    }
    export class Marker {
      constructor(opts?: any);
      setMap(map: Map | null): void;
      addListener(event: string, handler: Function): void;
    }
    export enum SymbolPath {
      CIRCLE = 0,
    }
  }
}

interface Window {
  google?: typeof google;
}
