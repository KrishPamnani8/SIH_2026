import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types/satquery';

export function downloadAnalysisPDFReport(result: AnalysisResult) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark Navy Slate #0F172A
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(56, 189, 248); // Ice Blue #38BDF8
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SatQuery AI - ISRO / SAC Evaluation Report', 14, 14);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()} | Task ID: ${result.executionTrace.taskId}`, 14, 22);

  // Section 1: Query & Executive Answer
  let currentY = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Query & Intelligence Summary', 14, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'oblique');
  doc.setTextColor(51, 65, 85);
  doc.text(`Query: "${result.query}"`, 14, currentY);

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  
  const splitAnswer = doc.splitTextToSize(result.answerText, pageWidth - 28);
  doc.text(splitAnswer, 14, currentY);
  currentY += splitAnswer.length * 5 + 4;

  // Bullet Points
  doc.setFont('helvetica', 'bold');
  doc.text('Key Observations:', 14, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  result.bulletPoints.forEach((pt) => {
    const splitPt = doc.splitTextToSize(`• ${pt}`, pageWidth - 32);
    doc.text(splitPt, 18, currentY);
    currentY += splitPt.length * 5;
  });

  // Section 2: Sensor-Aware Multimodal Grounding (SAM-GRI) & Reliability
  currentY += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SAM-GRI Reliability Metrics', 14, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Confidence Score: ${result.confidenceScore}%`, 18, currentY);
  currentY += 5;
  doc.text(`• Reliability Index: ${result.samGri.reliabilityScore}%`, 18, currentY);
  currentY += 5;
  doc.text(`• Sensor Attribution: SAR: ${result.samGri.sarWeight}% | Optical: ${result.samGri.opticalWeight}%`, 18, currentY);
  currentY += 5;
  doc.text(`• Cloud Cover Obscuration: ${result.samGri.cloudCoveragePercent}%`, 18, currentY);
  currentY += 8;

  // Section 3: Land Cover Composition (LULC)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Land Use / Land Cover (LULC) Breakdown', 14, currentY);
  currentY += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Water Body: ${result.lulc.water}%`, 18, currentY);
  doc.text(`Dense Vegetation: ${result.lulc.denseVeg}%`, 80, currentY);
  currentY += 5;
  doc.text(`Urban Fabric: ${result.lulc.urban}%`, 18, currentY);
  doc.text(`Agricultural Land: ${result.lulc.agriculture}%`, 80, currentY);
  currentY += 5;
  doc.text(`Bare Soil: ${result.lulc.bareSoil}%`, 18, currentY);
  currentY += 10;

  // Section 4: Auditable Execution Trace (ISRO Evaluation Standard)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Auditable Execution Trace (ISRO Evaluation Standard)', 14, currentY);
  currentY += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`• CRS Projection: ${result.executionTrace.epsgProjection}`, 18, currentY);
  currentY += 5;
  doc.text(`• Spatial Resolution: ${result.executionTrace.spatialResolution}`, 18, currentY);
  currentY += 5;
  doc.text(`• Processing Latency: ${result.executionTrace.processingLatencyMs} ms`, 18, currentY);
  currentY += 5;
  doc.text(`• Invoked Specialist Models:`, 18, currentY);
  currentY += 5;

  result.executionTrace.modelsInvoked.forEach((m) => {
    doc.text(`   - ${m}`, 22, currentY);
    currentY += 5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('SatQuery AI - Earth Observation Intelligence Engine | Confidential ISRO/SAC Hackathon Prototype', 14, pageHeight - 10);

  doc.save(`SatQuery_Analysis_Report_${result.executionTrace.taskId}.pdf`);
}

export function downloadGeoJSONReport(result: AnalysisResult) {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      taskId: result.executionTrace.taskId,
      query: result.query,
      timestamp: result.executionTrace.timestamp,
      crs: result.metadata.crs,
      confidenceScore: result.confidenceScore,
      samGri: result.samGri,
    },
    features: result.boundingBoxes.map((box) => ({
      type: 'Feature',
      properties: {
        id: box.id,
        label: box.label,
        category: box.category,
        score: box.score,
        utmCoordinates: box.utmCoordinates,
        latLonCoordinates: box.latLonCoordinates,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [box.bbox[1], box.bbox[0]],
            [box.bbox[3], box.bbox[0]],
            [box.bbox[3], box.bbox[2]],
            [box.bbox[1], box.bbox[2]],
            [box.bbox[1], box.bbox[0]],
          ],
        ],
      },
    })),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `SatQuery_Spatial_Grounding_${result.executionTrace.taskId}.geojson`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
