// hooks/useBubbleChart.js
import * as d3 from "d3";
import { useEffect } from "react";
import "./style.css";

const useBubbleChart = (chartRef, data) => {
  useEffect(() => {
    const width = 500;
    const height = 500;

    d3.select(chartRef.current).select("svg").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const flattenedData = data.flatMap((d) =>
      d.data.map((item) => ({
        ...item,
        type: d.type,
        backgroundColor: d.backgroundColor,
      }))
    );

    const maxTotalOccurance = d3.max(flattenedData, (d) => d.totalOccurance);

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxTotalOccurance])
      .range([10, 50]);

    const simulation = d3
      .forceSimulation(flattenedData)
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => radiusScale(d.totalOccurance))
      )
      .on("tick", ticked);

    const bubbles = svg.selectAll(".bubble").data(flattenedData);

    const bubbleGroup = bubbles.enter().append("g").attr("class", "bubble");

    bubbleGroup
      .append("circle")
      .attr("r", (d) => radiusScale(d.totalOccurance))
      .style("fill", (d) => d.backgroundColor);

    bubbleGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text((d) => truncateText(d.label, radiusScale(d.totalOccurance)))
      .style("font-size", (d) => `${radiusScale(d.totalOccurance) / 3}px`);

    // Create a tooltip
    const tooltip = d3
      .select(chartRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Show the tooltip on mouseover and hide it on mouseout
    bubbleGroup
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<div><strong>${d.label}</strong></div><div>Total Occurance: ${d.totalOccurance}</div>`
          )
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    function ticked() {
      bubbleGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    function truncateText(text, maxWidth) {
      const textLength = text.length;
      const maxChars = Math.floor(maxWidth / 6);
      return textLength > maxChars ? `${text.substr(0, maxChars)}...` : text;
    }

    return () => {
      simulation.stop();
      d3.select(chartRef.current).select("svg").remove();
    };
  }, [chartRef, data]);
};

export default useBubbleChart;
