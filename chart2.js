// Set up margins
const topMargin = 100;
const botMargin = 100;
const leftMargin = 100;
const rightMargin = 80;

const svgWidth = 1000 - (leftMargin + rightMargin);
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
    .domain([0, Math.ceil((d3.max(yearData, d => d.count) + 20000) / 20000) * 20000]) // Adjusted for 20k interval
    .range([svgHeight, 0]);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count));

  // Draw line
  const linePath = svg.append('path')
    .datum(yearData)
    .attr('class', 'line')
    .attr('d', line)
    .style('fill', 'none')
    .style('stroke', 'steelblue')
    .style('stroke-width', 4)
    .on("mouseover", function (event) {
      const totalCrashes = d3.sum(yearData, d => d.count);
      d3.select(this).style('stroke-width', 7).style('stroke', 'red');
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`Total Crashes from 2018 - 2023:<br/>${d3.format(',')(totalCrashes)}`); // Change here for 10k display
      tooltip.style('left', event.pageX + 'px').style('top', event.pageY - 28 + 'px');
    })
    .on("mouseout", function () {
      d3.select(this).style('stroke-width', 4).style('stroke', 'steelblue');
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Draw dots
  svg.selectAll(".dot")
    .data(yearData)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.count))
    .attr("r", 8)
    .style("fill", "steelblue")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("r", 12).style('fill', 'red');
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`Year: ${d.year}<br/>Occurrences: ${d3.format(',')(d.count)}`).style('left', event.pageX + 'px').style('top', event.pageY - 28 + 'px');
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("r", 8).style('fill', 'steelblue');
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Add a tooltip
  const tooltip = d3
    .select('#chart2')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Draw axes
  const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(y).tickValues(d3.range(0, Math.ceil((d3.max(yearData, d => d.count) + 20000) / 20000) * 20000 + 1, 20000)).tickFormat(d => d / 1000 + "k"); // For 20k interval and displaying 10k instead of 10,000

  // Draw axes
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${svgHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('font-size', '16px'); 

  svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
    .selectAll('text')
    .style('font-size', '16px'); 

  // Label x axis
  svg.append('text')
    .attr('x', svgWidth / 2)
    .attr('y', svgHeight + botMargin / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .text('Year');

  // Label y axis
  svg.append('text')
    .attr('x', -svgHeight / 2)
    .attr('y', -leftMargin / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .attr('transform', 'rotate(-90)')
    .text('Crashes');
});
