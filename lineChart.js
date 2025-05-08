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

    const xScale = d3.scaleBand()
      .domain(categories)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([10000000, 30000000])
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
    const yTicks = yScale.ticks(5);
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.fillText((tick / 1000000) + 'M', -10, y);
    });

    //X Labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    categories.forEach(cat => {
      const x = xScale(cat) + xScale.bandwidth() / 2;
      ctx.fillText(cat.split('R0-%-')[1], x, height + 5);
    });

    //Line Chart
    ctx.beginPath();
    ctx.strokeStyle = '#4CA5E4';
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
    ctx.fillStyle = 'blue';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    data.forEach(d => {
      const x = xScale(d.category) + xScale.bandwidth() / 2;
      const y = yScale(d.value);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText((d.value / 1000000).toFixed(1) + 'M', x, y - 6);
    });
  })
  .catch(error => {
    console.error("Failed to load JSON:", error);
  });