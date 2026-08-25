import type { AnalysisResult, AnalysisMode, DemoPreset, GeoTIFFMetadata } from '../types/satquery';

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-1',
    title: 'Single Optical VQA',
    subtitle: 'VRSBench / RSVQA benchmark scene',
    mode: 'single',
    datasetTag: 'VRSBench',
    question: 'Describe the major land-cover features and calculate water surface area.',
    metadata: {
      fileName: 'S2A_MSIL2A_20260215_T43REQ_R041_T1.tif',
      crs: 'EPSG:32643 (UTM Zone 43N)',
      bands: ['B02 (Blue)', 'B03 (Green)', 'B04 (Red)', 'B08 (NIR)'],
      resolution: '0.5m / pixel (Super-resolved)',
      dimensions: '1024 x 1024 px',
      acquisitionDate: '2026-02-15T05:42:10Z',
      sunAzimuth: '142.8°',
      cloudCoverPercent: 4.2,
      sensorType: 'Sentinel-2A MSI Multi-Spectral',
    },
    t1ImageName: 'Optical_S2_Single.tif',
  },
  {
    id: 'demo-2',
    title: 'Optical + SAR Cloud Canopy',
    subtitle: 'BigEarthNet.txt multimodal fusion demo',
    mode: 'cross_modal',
    datasetTag: 'BigEarthNet.txt',
    question: 'Identify flooded regions obscured under cloud canopy.',
    metadata: {
      fileName: 'S1_S2_FUSED_MULTIMODAL_43N.tif',
      crs: 'EPSG:32643 (UTM Zone 43N)',
      bands: ['B02', 'B03', 'B04', 'B08 (Opt)', 'VV (SAR dB)', 'VH (SAR dB)'],
      resolution: '10m / pixel (Native Sentinel-1/2)',
      dimensions: '1024 x 1024 px',
      acquisitionDate: '2026-03-01T06:15:30Z',
      sunAzimuth: '138.4°',
      cloudCoverPercent: 48.6,
      sensorType: 'Sentinel-2 (Optical) + Sentinel-1 (C-SAR Dual-Pol)',
    },
    t1ImageName: 'Optical_Cloudy.tif',
  },
  {
    id: 'demo-3',
    title: 'Bi-Temporal Urban Change',
    subtitle: 'CDVQA Change Detection benchmark',
    mode: 'bi_temporal',
    datasetTag: 'CDVQA',
    question: 'What changed between 2024 and 2026 in the urban sector?',
    metadata: {
      fileName: 'PAIR_2024_2026_CHANGE_SERIES.tif',
      crs: 'EPSG:32643 (UTM Zone 43N)',
      bands: ['B02', 'B03', 'B04', 'B08 (T1 & T2)'],
      resolution: '1.0m / pixel',
      dimensions: '1024 x 1024 px',
      acquisitionDate: 'T1: 2024-04-12 | T2: 2026-03-18',
      sunAzimuth: '145.2°',
      cloudCoverPercent: 1.8,
      sensorType: 'PlanetScope / Sentinel-2 Bi-Temporal Series',
    },
    t1ImageName: 'Optical_2024_T1.tif',
    t2ImageName: 'Optical_2026_T2.tif',
  },
];

export async function analyzeSatelliteQuery(
  mode: AnalysisMode,
  query: string,
  customMetadata?: Partial<GeoTIFFMetadata>,
  samGriSarWeight: number = 82
): Promise<AnalysisResult> {
  // Simulate network latency for deep neural model evaluation (380 - 600 ms)
  const latency = Math.floor(380 + Math.random() * 220);
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Mode 1: Single Image VQA
  if (mode === 'single') {
    return {
      query,
      mode: 'single',
      answerText:
        'The optical scene exhibits a structured riverine system flanked by dense riparian vegetation, agricultural field boundaries, and a developing urban nexus along the northeastern quadrant.',
      bulletPoints: [
        'Water Body Surface Area: 14.82 km² (18.5% total viewport coverage).',
        'Vegetation Health: High NDVI (>0.68) observed in southern forest cluster.',
        'Urban Fabric: Low-to-medium density commercial infrastructure spanning 0.85 km².',
        'Agricultural Parcels: Active crop cover detected across 32.4% of total land area.',
      ],
      confidenceScore: 95.4,
      samGri: {
        sarWeight: 10,
        opticalWeight: 90,
        cloudCoveragePercent: 4.2,
        reliabilityScore: 96.2,
        groundingConfidence: 94.8,
        spectralCoherence: 0.92,
        sarPenetrationRatio: 15.0,
        dynamicReasoning: 'Low cloud attenuation (4.2%). Primary attribution assigned to High-Res Sentinel-2 Optical bands (B04, B08).',
      },
      lulc: {
        water: 18.5,
        denseVeg: 28.4,
        urban: 12.6,
        agriculture: 32.4,
        bareSoil: 8.1,
      },
      boundingBoxes: [
        {
          id: 'bbox-1',
          label: 'Primary River Channel',
          score: 0.96,
          bbox: [28, 32, 78, 88],
          utmCoordinates: '43N 342150E 2064200N',
          latLonCoordinates: '18.6601° N, 73.5012° E',
          category: 'water',
        },
        {
          id: 'bbox-2',
          label: 'Dense Forest Sanctuary',
          score: 0.94,
          bbox: [68, 12, 92, 42],
          utmCoordinates: '43N 341800E 2063800N',
          latLonCoordinates: '18.6565° N, 73.4980° E',
          category: 'vegetation',
        },
        {
          id: 'bbox-3',
          label: 'Northeastern Commercial Grid',
          score: 0.91,
          bbox: [15, 45, 48, 85],
          utmCoordinates: '43N 342800E 2064800N',
          latLonCoordinates: '18.6655° N, 73.5074° E',
          category: 'structure',
        },
      ],
      segmentationMask: {
        id: 'mask-single',
        name: 'CORINE Land Cover 2026',
        categories: [
          { name: 'Water Body', color: '#0284c7', percentage: 18.5 },
          { name: 'Dense Vegetation', color: '#10b981', percentage: 28.4 },
          { name: 'Urban Fabric', color: '#f43f5e', percentage: 12.6 },
          { name: 'Agricultural Land', color: '#f59e0b', percentage: 32.4 },
          { name: 'Bare Soil', color: '#d97706', percentage: 8.1 },
        ],
      },
      executionTrace: {
        taskId: 'TASK-VQA-0982',
        taskType: 'Single-Image Remote Sensing VQA & Referring Expression Grounding',
        modelsInvoked: [
          'RS-InternVL-1B (Fine-tuned on BigEarthNet & VRSBench)',
          'Grounding DINO (Swin-T Backbone)',
          'U-Net ResNet-50 Land Cover Segmenter',
        ],
        processingLatencyMs: latency,
        timestamp: new Date().toISOString(),
        epsgProjection: 'EPSG:32643 (UTM Zone 43N)',
        tensorInputShape: '1 x 4 x 1024 x 1024 [Float32]',
        spatialResolution: '0.5m / pixel',
        attributionMethod: 'Integrated Gradients & Cross-Attention Heatmap',
        memoryUsedMb: 1420,
        parameters: {
          confidenceThreshold: 0.85,
          iouThreshold: 0.5,
          temperature: 0.2,
        },
      },
      metadata: customMetadata
        ? { ...DEMO_PRESETS[0].metadata, ...customMetadata }
        : DEMO_PRESETS[0].metadata,
    };
  }

  // Mode 2: Optical + SAR Cloud Canopy Fusion
  if (mode === 'cross_modal') {
    const sarAttribution = samGriSarWeight;
    const opticalAttribution = 100 - samGriSarWeight;

    return {
      query,
      mode: 'cross_modal',
      answerText:
        'Using Dual-Branch ViT Cross-Attention, Sentinel-1 C-SAR VV/VH microwave backscatter successfully penetrated the 48.6% cloud obscuration to reveal sub-canopy water logging and inundation behind urban levees.',
      bulletPoints: [
        'Cloud Penetration Efficiency: 98.4% recovery of land features obscured in Sentinel-2 Optical RGB.',
        'Sub-Canopy Inundation Area: 6.42 km² detected via dark VV/VH specular reflection (-18.2 dB).',
        'SAR Backscatter Anomaly: High urban double-bounce reflections (+4.8 dB) preserved under heavy cloud cover.',
        'SAM-GRI Reliability Index: Dynamically adjusted to SAR: ' +
          sarAttribution +
          '% / Optical: ' +
          opticalAttribution +
          '% due to high atmospheric interference.',
      ],
      confidenceScore: 93.8,
      samGri: {
        sarWeight: sarAttribution,
        opticalWeight: opticalAttribution,
        cloudCoveragePercent: 48.6,
        reliabilityScore: 94.2,
        groundingConfidence: 92.1,
        spectralCoherence: 0.84,
        sarPenetrationRatio: 91.5,
        dynamicReasoning:
          'High cloud attenuation (48.6%). Optical confidence degraded. Dual-branch transformer automatically boosted Sentinel-1 C-SAR microwave backscatter weighting to ' +
          sarAttribution +
          '%.',
      },
      lulc: {
        water: 24.2,
        denseVeg: 22.1,
        urban: 14.8,
        agriculture: 28.5,
        bareSoil: 10.4,
      },
      boundingBoxes: [
        {
          id: 'bbox-sar-1',
          label: 'Cloud-Obscured Flood Inundation Zone',
          score: 0.95,
          bbox: [22, 35, 65, 80],
          utmCoordinates: '43N 342200E 2064300N',
          latLonCoordinates: '18.6610° N, 73.5020° E',
          category: 'flood',
        },
        {
          id: 'bbox-sar-2',
          label: 'Sub-Canopy Saturated Soil Sector',
          score: 0.91,
          bbox: [65, 60, 88, 90],
          utmCoordinates: '43N 342900E 2063900N',
          latLonCoordinates: '18.6570° N, 73.5085° E',
          category: 'water',
        },
      ],
      segmentationMask: {
        id: 'mask-crossmodal',
        name: 'Multimodal Fused Land Cover',
        categories: [
          { name: 'Flooded / Water Body', color: '#0284c7', percentage: 24.2 },
          { name: 'Dense Vegetation', color: '#10b981', percentage: 22.1 },
          { name: 'Urban Structures', color: '#f43f5e', percentage: 14.8 },
          { name: 'Agricultural Land', color: '#f59e0b', percentage: 28.5 },
          { name: 'Cloud / Shadow (Corrected)', color: '#94a3b8', percentage: 10.4 },
        ],
      },
      executionTrace: {
        taskId: 'TASK-FUSION-8831',
        taskType: 'Optical + SAR Dual-Branch Cross-Attention Multimodal Grounding',
        modelsInvoked: [
          'Dual-ViT Cross-Modal Fusion Encoder (Sentinel-1/2)',
          'RS-LLaVA-Multimodal-13B Fine-tuned',
          'SAR VV/VH Speckle Reduction & Feature Matcher',
        ],
        processingLatencyMs: latency,
        timestamp: new Date().toISOString(),
        epsgProjection: 'EPSG:32643 (UTM Zone 43N)',
        tensorInputShape: '1 x 6 x 1024 x 1024 [Optical RGB/NIR + SAR Dual-Pol]',
        spatialResolution: '10m / pixel (Native)',
        attributionMethod: 'SAM-GRI Dynamic Cross-Attention Attribution',
        memoryUsedMb: 2180,
        parameters: {
          sarBackscatterMinDb: -25.0,
          sarBackscatterMaxDb: 10.0,
          fusionLayerDepth: 12,
        },
      },
      metadata: customMetadata
        ? { ...DEMO_PRESETS[1].metadata, ...customMetadata }
        : DEMO_PRESETS[1].metadata,
    };
  }

  // Mode 3: Bi-Temporal Change Analysis
  return {
    query,
    mode: 'bi_temporal',
    answerText:
      'Bi-temporal change evaluation between T1 (2024-04-12) and T2 (2026-03-18) reveals substantial urban footprint expansion (+3.12 km²) concentrated in the northeastern quadrant alongside localized agricultural conversion.',
    bulletPoints: [
      'Urban Infrastructure Growth: +3.12 km² (+24.8% relative expansion over 2 years).',
      'Vegetation Canopy Reduction: -1.84 km² converted into industrial logistics sites.',
      'Water Reservoir Fluctuations: +0.65 km² increase in surface area due to seasonal drainage.',
      'Change Severity: High confidence (96.5%) recorded by ChangeFormer ΔF difference matrix.',
    ],
    confidenceScore: 96.5,
    samGri: {
      sarWeight: 20,
      opticalWeight: 80,
      cloudCoveragePercent: 1.8,
      reliabilityScore: 97.4,
      groundingConfidence: 95.9,
      spectralCoherence: 0.95,
      sarPenetrationRatio: 40.0,
      dynamicReasoning: 'Dual clear-sky optical baseline (T1 & T2 cloud cover < 2.0%). High temporal alignment precision.',
    },
    lulc: {
      water: 19.2,
      denseVeg: 24.5,
      urban: 19.8,
      agriculture: 27.0,
      bareSoil: 9.5,
    },
    boundingBoxes: [
      {
        id: 'bbox-cd-1',
        label: 'New Commercial Construction Sector (2024-2026)',
        score: 0.97,
        bbox: [20, 50, 45, 82],
        utmCoordinates: '43N 342600E 2064700N',
        latLonCoordinates: '18.6645° N, 73.5050° E',
        category: 'infrastructure',
      },
      {
        id: 'bbox-cd-2',
        label: 'Reservoir Extension (Water Gain)',
        score: 0.93,
        bbox: [55, 55, 78, 88],
        utmCoordinates: '43N 342850E 2064100N',
        latLonCoordinates: '18.6590° N, 73.5080° E',
        category: 'water',
      },
    ],
    segmentationMask: {
      id: 'mask-bitemporal',
      name: 'T2 (2026) Classified Land Cover',
      categories: [
        { name: 'Water Body', color: '#0284c7', percentage: 19.2 },
        { name: 'Dense Vegetation', color: '#10b981', percentage: 24.5 },
        { name: 'Urban Fabric (Expanded)', color: '#f43f5e', percentage: 19.8 },
        { name: 'Agricultural Land', color: '#f59e0b', percentage: 27.0 },
        { name: 'Bare Soil', color: '#d97706', percentage: 9.5 },
      ],
    },
    changeHeatmap: {
      changeAreaKm2: 4.85,
      increasedUrbanKm2: 3.12,
      vegetationLossKm2: 1.84,
      waterVarianceKm2: 0.65,
      severityLevels: [
        { label: 'High Structural Expansion (Red)', percent: 55.4, color: '#ef4444' },
        { label: 'Water Body Increase (Blue)', percent: 24.2, color: '#38bdf8' },
        { label: 'Vegetation Shift (Amber)', percent: 20.4, color: '#f59e0b' },
      ],
    },
    executionTrace: {
      taskId: 'TASK-CDVQA-4019',
      taskType: 'Bi-Temporal Change Detection & Siamese Transformer VQA',
      modelsInvoked: [
        'ChangeFormer (Siamese Bitemporal ViT Encoder)',
        'RS-InternVL-1B Difference Alignment Module',
        'Spatial Difference Differencing ΔF Matrix Estimator',
      ],
      processingLatencyMs: latency,
      timestamp: new Date().toISOString(),
      epsgProjection: 'EPSG:32643 (UTM Zone 43N)',
      tensorInputShape: '2 x 4 x 1024 x 1024 [T1 & T2 Stack]',
      spatialResolution: '1.0m / pixel',
      attributionMethod: 'Bitemporal Feature Differencing & Siamese Attention Map',
      memoryUsedMb: 1850,
      parameters: {
        temporalIntervalMonths: 23.2,
        changeThresholdSensitivity: 0.42,
      },
    },
    metadata: customMetadata
      ? { ...DEMO_PRESETS[2].metadata, ...customMetadata }
      : DEMO_PRESETS[2].metadata,
  };
}
