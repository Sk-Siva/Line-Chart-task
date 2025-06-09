import { calculateIChartLimits } from './limitsCalculation.js';
import { drawIChart } from './iChart.js';

let cachedData = null;
let chartType = "line";
let cachedMainChart = null;
let chartDimensions = null;

const visibleCanvas = document.getElementById('chartCanvas');
const visibleCtx = visibleCanvas.getContext('2d');

document.getElementById('chartType').addEventListener('change', (e) => {
  chartType = e.target.value;
  console.log('Chart type changed to:', chartType);
  if (cachedData && cachedMainChart) {
    drawChartOverlays(cachedData, chartType);
  }
});

fetch('./singleMesDs.json')
  .then(response => response.json())
  .then(json => {
    cachedData = json;
    drawChart(cachedData, chartType);
  })
  .catch(error => {
    console.error("Failed to load JSON:", error);
  });

function drawChart(singleMesDs, chartType) {
  const margin = { top: 40, right: 40, bottom: 40, left: 100 };
  const width = visibleCanvas.width - margin.left - margin.right;
  const height = visibleCanvas.height - margin.top - margin.bottom;

  const categories = singleMesDs.groupMapping.NO_GROUP.map(item => item.categoryId);
  const data = singleMesDs.groupMapping.NO_GROUP.map(row => {
    const rowId = row.dataRowId;
    const value = singleMesDs.dataRowMapping[rowId].AC;
    return { category: row.categoryId, value };
  });

  const xScale = d3.scaleBand()
    .domain(categories)
    .range([0, width])
    .padding(0.1);

  const yMin = d3.min(data, d => d.value);
  const yMax = d3.max(data, d => d.value);

  // Calculate Limits
  const limits = calculateIChartLimits(data);
  console.log('Chart type:', chartType, 'Limits:', limits);

  const yScale = d3.scaleLinear()
    .domain([
      Math.min(limits.lowerControlLimit, yMin * 0.9),
      Math.max(limits.upperControlLimit, yMax * 1.1)
    ])
    .range([height, 0]);

  // Store dimensions
  chartDimensions = { margin, width, height, xScale, yScale, data, limits };

  // Main Chart
  if (!cachedMainChart) {
    cachedMainChart = document.createElement('canvas');
    cachedMainChart.width = visibleCanvas.width;
    cachedMainChart.height = visibleCanvas.height;
    const ctxMain = cachedMainChart.getContext('2d');
    
    ctxMain.clearRect(0, 0, cachedMainChart.width, cachedMainChart.height);
    ctxMain.save();
    ctxMain.translate(margin.left, margin.top);
    
    drawAxes(ctxMain, width, height, yScale, categories, xScale);
    drawMainLineChart(ctxMain, data, xScale, yScale, width, height);
    ctxMain.restore();
  }

  drawChartOverlays(singleMesDs, chartType);
}

function drawChartOverlays(singleMesDs, chartType) {
  visibleCtx.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
  visibleCtx.drawImage(cachedMainChart, 0, 0);

  if (chartType === "i" && chartDimensions) {
    const { margin, width, limits, yScale } = chartDimensions;
    
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = visibleCanvas.width;
    overlayCanvas.height = visibleCanvas.height;
    const ctxOverlay = overlayCanvas.getContext('2d');
    
    ctxOverlay.save();
    ctxOverlay.translate(margin.left, margin.top);
    
    //I chart
    drawIChart(ctxOverlay, limits, yScale, width);
    
    ctxOverlay.restore();
    
    visibleCtx.drawImage(overlayCanvas, 0, 0);
  }
}

function resetCache() {
  cachedMainChart = null;
  chartDimensions = null;
}

function drawAxes(ctx, width, height, yScale, categories, xScale) {
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.textAlign = "right";
  const yTicks = yScale.ticks(5);
  yTicks.forEach(tick => {
    const y = yScale(tick);
    ctx.fillText((tick / 1000000).toFixed(1) + 'M', -10, y);
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  categories.forEach(cat => {
    const x = xScale(cat) + xScale.bandwidth() / 2;
    ctx.fillText(cat.split('R0-%-')[1], x, height + 5);
  });
}

function drawMainLineChart(ctx, data, xScale, yScale, width, height) {
  ctx.beginPath();
  ctx.strokeStyle = '#4CA5E4';
  ctx.lineWidth = 2;

  data.forEach((d, i) => {
    const x = xScale(d.category) + xScale.bandwidth() / 2;
    const y = yScale(d.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = 'blue';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  data.forEach(d => {
    const x = xScale(d.category) + xScale.bandwidth() / 2;
    const y = yScale(d.value);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText((d.value / 1000000).toFixed(1) + 'M', x, y - 6);
  });
}