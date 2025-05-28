fetch('./singleMesDs.json')
  .then(response => response.json())
  .then(singleMesDs => {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');

    const margin = { top: 40, right: 40, bottom: 40, left: 100 };
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;

    const categories = singleMesDs.groupMapping.NO_GROUP.map(item => item.categoryId);
    const data = singleMesDs.groupMapping.NO_GROUP.map(row => {
      const rowId = row.dataRowId;
      const value = singleMesDs.dataRowMapping[rowId].AC;
      return { category: row.categoryId, value };
    });

    //Mean
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    //Moving Range
    const movingRanges = [];
    for (let i = 1; i < values.length; i++) {
      movingRanges.push(Math.abs(values[i] - values[i - 1]));
    }

    const avgMR = movingRanges.reduce((sum, val) => sum + val, 0) / movingRanges.length;
    const d2 = 1.128; //Constant
    const sigma = avgMR / d2;

    const UCL = mean + 3 * sigma;
    const LCL = mean - 3 * sigma;

    const yMin = Math.min(LCL, ...values);
    const yMax = Math.max(UCL, ...values);

    //Categorical X Axis
    const xScale = d3.scaleBand()
      .domain(categories)
      .range([0, width])
      .padding(0.1);

    //Continous Y Axis
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    ctx.translate(margin.left, margin.top);

    //Y Axis
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    //X Axis
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.stroke();

    //Y Lables
    ctx.fillStyle = "#000";
    ctx.textAlign = "right";
    const yTicks = yScale.ticks(10);
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.fillText((tick / 1000000).toFixed(1) + 'M', -10, y);
    });

    //X Labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    categories.forEach(cat => {
      const x = xScale(cat) + xScale.bandwidth() / 2;
      ctx.fillText(cat.split('R0-%-')[1], x, height + 5);
    });

    // Center Line
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.setLineDash([]);
    ctx.moveTo(0, yScale(mean));
    ctx.lineTo(width, yScale(mean));
    ctx.stroke();

    // UCL & LCL
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'blue';

    ctx.beginPath();
    ctx.moveTo(0, yScale(UCL));
    ctx.lineTo(width, yScale(UCL));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, yScale(LCL));
    ctx.lineTo(width, yScale(LCL));
    ctx.stroke();

    ctx.setLineDash([]);


    // Data Line
    ctx.beginPath();
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 2;
    data.forEach((d, i) => {
      const x = xScale(d.category) + xScale.bandwidth() / 2;
      const y = yScale(d.value);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    //Data Points
    ctx.fillStyle = 'grey';
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
  })
  .catch(error => {
    console.error("Failed to load JSON:", error);
  });