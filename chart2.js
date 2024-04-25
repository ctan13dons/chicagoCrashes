// Set up margins
const topMargin = 100;
const botMargin = 100;
const leftMargin = 100;
const rightMargin = 100;

const svgWidth = 900 - (leftMargin + rightMargin);
const svgHeight = 600 - (topMargin + botMargin);

const dataLink = './TrafficCrashesMAIN.csv';

// Load the data
d3.csv(dataLink).then((data) => {
  // Initialize an object to count occurrences of each year
  const yearCounts = {};

  // Loop through the data and count occurrences of each year
  data.forEach((d) => {
    // Parse the date and extract the year
    const date = new Date(d.CRASH_DATE);
    const year = date.getFullYear();

    // Increment the count for this year
    if (yearCounts[year]) {
      yearCounts[year]++;
    } else {
      yearCounts[year] = 1;
    }
  });

  // Create an array of objects with year and count for D3 data binding
  const yearData = [];
  for (let year = 2018; year <= 2023; year++) {
    yearData.push({ year: year, count: yearCounts[year] || 0 });
  }

  // Create SVG element
  const svg = d3
    .select('#chart2')
    .append('svg')
    .attr('width', svgWidth + leftMargin + rightMargin)
    .attr('height', svgHeight + topMargin + botMargin)
    .append('g')
    .attr('transform', `translate(${leftMargin},${topMargin})`);

  // Scales for x and y
  const x = d3
    .scaleLinear()
    .domain([2018, 2023])
    .range([0, svgWidth]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(yearData, d => d.count) + 20000])
    .range([svgHeight, 0]);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count));

  // Draw line
  svg.append('path')
    .datum(yearData)
    .attr('class', 'line')
    .attr('d', line)
    .style('fill', 'none')
    .style('stroke', 'steelblue')
    .style('stroke-width', 2);

  // Draw axes
  const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(y);

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${svgHeight})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis);

  // Label x axis
  svg.append('text')
    .attr('x', svgWidth / 2)
    .attr('y', svgHeight + botMargin / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Year');

  // Label y axis
  svg.append('text')
    .attr('x', -svgHeight / 2)
    .attr('y', -leftMargin / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .attr('transform', 'rotate(-90)')
    .text('Occurrences');
});
