// Set up margins and dimensions
const margin = { top: 100, right: 100, bottom: 100, left: 120 };
const width = 1000 - margin.left - margin.right;
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
  let towAwayCount = 0;

  data.forEach(d => {
    const crashType = d.CRASH_TYPE;
    const injuriesTotal = +d.INJURIES_TOTAL; // Convert string to number

    // Logic for determining counts
    if (crashType === "INJURY AND / OR TOW DUE TO CRASH") {
      if (injuriesTotal > 0) {
        injuryCount++;
      } else {
        towAwayCount++;
      }
    }
  });

  // Calculate the total count of entries
  const totalCount = data.length;

  // Calculate the count of "drive away" entries
  const driveAwayCount = totalCount - towAwayCount;

  // Calculate the count of "no injury" entries
  const noInjuryCount = totalCount - injuryCount;

  // Data for diverging bar chart
  const divergingData = [
    { type: "TOTAL", count: totalCount },
    { type: "NO INJURY", count: noInjuryCount },
    { type: "INJURY", count: -injuryCount }, // Negative count for left-facing bars
    { type: "DRIVE AWAY", count: driveAwayCount },
    { type: "TOW AWAY", count: -towAwayCount }, // Negative count for left-facing bars
    { type: "INJURY & TOW", count: -(injuryCount + towAwayCount) } // Negative count for left-facing bar
  ];

  // Create scales
  const x = d3.scaleLinear()
    .domain([-Math.max(...divergingData.map(d => Math.abs(d.count))), Math.max(...divergingData.map(d => Math.abs(d.count)))]).nice() // Adjusted domain to accommodate negative values
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(divergingData.map(d => d.type))
    .range([0, height])
    .padding(0.1);

  // Format x-axis ticks to be positives and k
  const customXAxisTickFormat = (value) => {
    if (value === 0) {
      return 0;
    }
    return Math.abs(value / 1000) + "k";
  };

  // Add a comma in the hover value
  const formatValue = d3.format(","); // This will add commas to numbers

  // Create bars
  svg.selectAll(".bar")
    .data(divergingData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(Math.min(0, d.count))) // Use Math.min to determine the start position of the bars
    .attr("y", d => y(d.type))
    .attr("width", d => Math.abs(x(d.count) - x(0)))
    .attr("height", y.bandwidth() * 0.7)
    .attr("fill", d => {
      if (d.type === "TOTAL") {
        return "gray"; 
      } else {
        return (d.type === "INJURY" || d.type === "TOW AWAY" || d.type === "INJURY & TOW") ? "red" : "green";
      }
    })
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill', 'steelblue');
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`${d.type}<br/>Count: ${formatValue(Math.abs(d.count))}`).style('left', event.pageX + 'px').style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function (d) {
      d3.select(this).attr('fill', d => {
        if (d.type === "TOTAL") {
          return "gray"; 
        } else {
          return (d.type === "INJURY" || d.type === "TOW AWAY" || d.type === "INJURY & TOW") ? "red" : "green";
        }
      });
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Add x-axis with custom tick format
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(customXAxisTickFormat))
    .selectAll("text")
    .style("font-size", "16px");

  // Add y-axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "15px");

  // Add x-axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.top - 50)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text('Crash Count');

  // Add a tooltip
  const tooltip = d3
    .select('#chart4')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
});
