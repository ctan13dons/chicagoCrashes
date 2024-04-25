// Define the width and height of the SVG
const width = 900;
const height = 600;

// Append the SVG to the container
const svg = d3.select("#chart3")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const dataLink = './TrafficCrashesMAIN.csv';

// Read the CSV data
d3.csv(dataLink).then(function(data) {
  data = data.filter(d => d.PRIM_CONTRIBUTORY_CAUSE !== "NOT APPLICABLE");
  data = data.filter(d => d.PRIM_CONTRIBUTORY_CAUSE !== "UNABLE TO DETERMINE");
  // Aggregate counts for each unique value in the column PRIM_CONTRIBUTORY_CAUSE
  const causeCounts = d3.rollup(data, v => v.length, d => d.PRIM_CONTRIBUTORY_CAUSE);

  // Convert aggregated data to an array of objects
  const causeData = Array.from(causeCounts, ([cause, count]) => ({ cause, count }));

  // Create a treemap layout
  const treemapLayout = d3.treemap()
    .size([width, height])
    .padding(1)
    .round(true);

  // Construct the hierarchy from the causeData
  const root = d3.hierarchy({ values: causeData }, d => d.values)
    .sum(d => d.count)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  // Generate the treemap nodes
  treemapLayout(root);

  // Draw rectangles for each node
  svg.selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", "steelblue")
    .attr("stroke", "white");

  // Add text labels
  svg.selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", d => d.x0 + 5)
    .attr("y", d => d.y0 + 20)
    .text(d => `${d.data.cause}`) //`${d.data.cause} (${d.data.count})`
    .attr("font-size", "10px")
    .attr("fill", "white");
});