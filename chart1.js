// Set up margins
const topMargin = 150;
const botMargin = 150;
const leftMargin = 150;
const rightMargin = 150;

const svgWidth =
  window.innerWidth - (leftMargin + rightMargin);
const svgHeight =
  window.innerHeight - (topMargin + botMargin);

// Set up svg area
const svgBody = d3
  .select('#chart1')
  .append('svg')
  .attr('width', window.innerWidth)
  .attr('height', window.innerHeight)
  .append('g') // group and move
  .attr(
    'transform',
    'translate(' + leftMargin + ',' + topMargin + ')',
  );

// Put title at the top
svgBody
  .append('text')
  .attr('x', svgWidth / 2)
  .attr('y', -topMargin / 2)
  .attr('text-anchor', 'middle')
  .style('font-size', '20px')
  .text(
    'Lighting Conditions Count Comparison',
  );

const link =
  './TrafficCrashesMAIN.csv';

d3.csv(link).then((data) => {
  // Filter data for darkness conditions ('DARKNESS, LIGHTED ROAD', 'DARKNESS', or 'DUSK')
  const darknessData = data.filter(d => 
    d.LIGHTING_CONDITION === 'DARKNESS, LIGHTED ROAD' ||
    d.LIGHTING_CONDITION === 'DARKNESS' ||
    d.LIGHTING_CONDITION === 'DUSK'
  );

  // Count occurrences of darkness conditions
  const darknessCount = darknessData.length;

  // Count occurrences of daylight conditions
  const daylightCount = data.length - darknessCount;

  const chartData = [
    { condition: 'Darkness', count: darknessCount },
    { condition: 'Daylight', count: daylightCount }
  ];

  // x-axis scale
  const x = d3
    .scaleBand()
    .range([0, svgWidth])
    .domain(chartData.map(d => d.condition))
    .padding(0.2);

  // x-axis
  svgBody
    .append('g')
    .attr('transform', `translate(0,${svgHeight})`)
    .call(d3.axisBottom(x));

  // y-axis scale
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(chartData, d => d.count)])
    .range([svgHeight, 0]);

  // y-axis
  svgBody.append('g').call(d3.axisLeft(y).tickSizeOuter(0));

  // Draw bars
  svgBody
    .selectAll('.bar')
    .data(chartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.condition))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.count))
    .attr('height', d => svgHeight - y(d.count))
    .attr('fill', d => d.condition === 'Darkness' ? 'steelblue' : 'orange');

  // x-axis label
  svgBody
    .append('text')
    .attr(
      'transform',
      `translate(${svgWidth / 2},${svgHeight + topMargin - 50})`,
    )
    .style('text-anchor', 'middle')
    .text('Lighting Conditions');

  // y-axis label
  svgBody
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -leftMargin + 40)
    .attr('x', -svgHeight / 2)
    .style('text-anchor', 'middle')
    .text('Count');

});
