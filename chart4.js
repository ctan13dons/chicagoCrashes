// Set up margins and dimensions
const margin = { top: 100, right: 100, bottom: 100, left: 100 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select("#chart4")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const dataLink = './TrafficCrashesMAIN.csv';

// Load CSV data
d3.csv(dataLink).then((data) => {
  // Initialize counts for each type of crash
  let injuryCount = 0;
  let noInjuryCount = 0;
  let driveAwayCount = 0;
  let towAwayCount = 0;

  data.forEach(d => {
    const crashType = d.CRASH_TYPE;
    if (crashType.includes("DRIVE AWAY")) {
      driveAwayCount++;
    } else {
      towAwayCount++;
    }
  });

  data.forEach(d => {
    const crashType = d.CRASH_TYPE;
    if (crashType.includes("NO INJURY")) {
      noInjuryCount++;
    } else {
      injuryCount++;
    }
  });

  // Data for diverging bar chart
  const divergingData = [
    { type: "NO INJURY", count: noInjuryCount },
    { type: "INJURY", count: -injuryCount }, // Negative count for left-facing bars
    { type: "DRIVE AWAY", count: driveAwayCount },
    { type: "TOW AWAY", count: -towAwayCount } // Negative count for left-facing bars
  ];

  // Create scales
  const x = d3.scaleLinear()
    .domain([-Math.max(...divergingData.map(d => Math.abs(d.count))), Math.max(...divergingData.map(d => Math.abs(d.count)))]).nice() // Adjusted domain to accommodate negative values
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(divergingData.map(d => d.type))
    .range([0, height])
    .padding(0.1);

  // Create bars
  svg.selectAll(".bar")
    .data(divergingData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(Math.min(0, d.count))) // Use Math.min to determine the start position of the bars
    .attr("y", d => y(d.type))
    .attr("width", d => Math.abs(x(d.count) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", "steelblue")
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill', d => (d.type === "INJURY" || d.type === "TOW AWAY") ? "red" : "green");
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`${d.type}<br/>Count: ${Math.abs(d.count)}`).style('left', event.pageX + 'px').style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function (d) {
      d3.select(this).attr('fill', 'steelblue');
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Add labels
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.top - 50)
    .attr('text-anchor', 'middle')
    .text('Crash Count');

  // Add y-axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 40)
    .attr('x', -height / 2)
    .attr('text-anchor', 'middle')
    .text('Crash Type');

  // Add a tooltip
  const tooltip = d3
    .select('#chart4')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
});
