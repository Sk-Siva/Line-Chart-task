export function drawIChart(ctx, limits, yScale, width) {
  if (!limits) return;

  ctx.strokeStyle = 'blue';
  ctx.setLineDash([5, 3]);

  // Center Line
  const centerY = yScale(limits.centerLine);
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  // Upper Control Limit
  const uclY = yScale(limits.upperControlLimit);
  ctx.beginPath();
  ctx.moveTo(0, uclY);
  ctx.lineTo(width, uclY);
  ctx.stroke();

  // Lower Control Limit
  const lclY = yScale(limits.lowerControlLimit);
  ctx.beginPath();
  ctx.moveTo(0, lclY);
  ctx.lineTo(width, lclY);
  ctx.stroke();

  ctx.setLineDash([]);
}
