export const calculateMean = (values) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const calculateIChartLimits = (data) => {
  const values = data.map((d) => d.value);
  const mean = calculateMean(values);
  const stdDev = Math.sqrt(mean * (mean + 1));

  return {
    centerLine: mean,
    upperControlLimit: mean + 3 * stdDev,
    lowerControlLimit: Math.max(0, mean - 3 * stdDev)
  };
};