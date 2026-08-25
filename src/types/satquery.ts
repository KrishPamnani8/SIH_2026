export type AnalysisMode = 'single' | 'cross_modal' | 'bi_temporal';
export type ThemeMode = 'dark' | 'light';

export interface GeoTIFFMetadata {
  fileName: string;
  crs: string; // e.g. "EPSG:32643 (UTM Zone 43N)"
  bands: string[]; // e.g. ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)", "B11 (SWIR)"]
  resolution: string; // e.g. "0.5m / pixel"
  dimensions: string; // e.g. "1024 x 1024 px"
  acquisitionDate: string;
  sunAzimuth?: string;
  cloudCoverPercent: number;
  sensorType: string; // e.g. "Sentinel-2 MSI / Sentinel-1 C-SAR"
}

export interface BoundingBox {
  id: string;
  label: string;
  score: number; // e.g. 0.94
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in normalized 0-100%
  utmCoordinates: string;
  latLonCoordinates: string;
  category: 'water' | 'structure' | 'flood' | 'vegetation' | 'infrastructure';
}

export interface SegmentationCategory {
  name: string;
  color: string;
  percentage: number;
}

export interface SegmentationMask {
  id: string;
  name: string;
  categories: SegmentationCategory[];
}

export interface ChangeHeatmap {
  changeAreaKm2: number;
  increasedUrbanKm2: number;
  vegetationLossKm2: number;
  waterVarianceKm2: number;
  severityLevels: { label: string; percent: number; color: string }[];
}

export interface SAMGRIIndex {
  sarWeight: number; // 0 - 100%
  opticalWeight: number; // 0 - 100%
  cloudCoveragePercent: number;
  reliabilityScore: number; // e.g. 94.8%
  groundingConfidence: number; // e.g. 92.4%
  spectralCoherence: number; // e.g. 0.89
  sarPenetrationRatio: number; // e.g. 84.5%
  dynamicReasoning: string;
}

export interface LULCComposition {
  water: number;
  denseVeg: number;
  urban: number;
  agriculture: number;
  bareSoil: number;
}

export interface ExecutionTrace {
  taskId: string;
  taskType: string;
  modelsInvoked: string[];
  processingLatencyMs: number;
  timestamp: string;
  epsgProjection: string;
  tensorInputShape: string;
  spatialResolution: string;
  attributionMethod: string;
  memoryUsedMb: number;
  parameters: Record<string, string | number>;
}

export interface AnalysisResult {
  query: string;
  mode: AnalysisMode;
  answerText: string;
  bulletPoints: string[];
  confidenceScore: number;
  samGri: SAMGRIIndex;
  lulc: LULCComposition;
  boundingBoxes: BoundingBox[];
  segmentationMask: SegmentationMask;
  changeHeatmap?: ChangeHeatmap;
  executionTrace: ExecutionTrace;
  metadata: GeoTIFFMetadata;
}

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  mode: AnalysisMode;
  datasetTag: string; // e.g. "VRSBench", "BigEarthNet.txt", "CDVQA"
  question: string;
  metadata: GeoTIFFMetadata;
  t1ImageName: string;
  t2ImageName?: string;
}
