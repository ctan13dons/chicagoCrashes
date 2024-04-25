// Set up margins
const topMargin = 100;
const botMargin = 100;
const leftMargin = 100;
const rightMargin = 100;

const svgWidth = 900 - (leftMargin + rightMargin);
const svgHeight = 600 - (topMargin + botMargin);

// Set up svg area
const svgBody = d3
  .select('#chart1')
  .append('svg')
  .attr('width', svgWidth + leftMargin + rightMargin)
  .attr('height', svgHeight + topMargin + botMargin)
  .append('g') // group and move
  .attr('transform', 'translate(' + leftMargin + ',' + topMargin + ')');

// Put title at the top
svgBody
  .append('text')
  .attr('x', svgWidth / 2)
  .attr('y', -topMargin / 2)
  .attr('text-anchor', 'middle')
  .style('font-size', '20px')
  .text('Hourly Crash Count');

const link = './TrafficCrashesMAIN.csv';

// Load CSV data
d3.csv(link).then((data) => {
  // Count occurrences for each hour
  const hourCounts = Array.from({ length: 24 }, () => 0);
  data.forEach(d => {
    const hour = parseInt(d.CRASH_HOUR);
    hourCounts[hour]++;
  });

  const chartData = hourCounts.map((count, hour) => ({ hour: hour, count: count }));

  // x-axis scale
  const x = d3
    .scaleBand()
    .range([0, svgWidth])
    .domain(chartData.map(d => d.hour.toString()))
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
    .attr('x', d => x(d.hour.toString()))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.count))
    .attr('height', d => svgHeight - y(d.count))
    .attr('fill', 'steelblue')
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill', 'red');
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`Hour: ${d.hour}<br/>Crash Count: ${d.count}`).style('left', event.pageX + 'px').style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function (d) {
      d3.select(this).attr('fill', 'steelblue');
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // x-axis label
  svgBody
    .append('text')
    .attr('x', svgWidth / 2)
    .attr('y', svgHeight + topMargin - 50)
    .attr('text-anchor', 'middle')
    .text('Hour of the Day');

  // y-axis label
  svgBody
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -leftMargin + 40)
    .attr('x', -svgHeight / 2)
    .attr('text-anchor', 'middle')
    .text('Crash Count');
  
  const tooltip = d3
    .select('#chart1')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
});
