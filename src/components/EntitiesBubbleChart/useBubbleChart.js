// hooks/useBubbleChart.js
import * as d3 from "d3";
import { useEffect } from "react";
import "./style.css";

const useBubbleChart = (chartRef, data, width, height, onBubbleClick) => {
  useEffect(() => {
    d3.select(chartRef.current).select("svg").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const flattenedData = data.flatMap((d) =>
      d.data.map((item) => ({
        ...item,
        type: d.type,
        backgroundColor: d.backgroundColor,
      }))
    );

    const maxTotalOccurrence = d3.max(flattenedData, (d) => d.totalOccurrence);

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxTotalOccurrence])
      .range([10, 50]);

    function forceBox() {
      for (const d of flattenedData) {
        d.x = Math.max(
          radiusScale(d.totalOccurrence),
          Math.min(width - radiusScale(d.totalOccurrence), d.x)
        );
        d.y = Math.max(
          radiusScale(d.totalOccurrence),
          Math.min(height - radiusScale(d.totalOccurrence), d.y)
        );
      }
    }

    const simulation = d3
      .forceSimulation(flattenedData)
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force(
        "collision",
        d3.forceCollide().radius((d) => radiusScale(d.totalOccurrence))
      )
      .force("box", forceBox)
      .on("tick", ticked);

    const bubbles = svg.selectAll(".bubble").data(flattenedData);

    const bubbleGroup = bubbles.enter().append("g").attr("class", "bubble");

    bubbleGroup
      .append("circle")
      .attr("r", (d) => radiusScale(d.totalOccurrence))
      .style("fill", (d) => d.backgroundColor);

    bubbleGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text((d) => truncateText(d.label, radiusScale(d.totalOccurrence)))
      .style("font-size", (d) => `${radiusScale(d.totalOccurrence) / 3}px`);

    // Create a tooltip
    const tooltip = d3
      .select(chartRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Show the tooltip on mouseover and hide it on mouseout
    bubbleGroup
      .on("mouseover", (event, d) => {
        const container = chartRef.current.getBoundingClientRect();
        const x = d.x - container.left;
        const y = d.y - container.top;

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<div><strong>${d.label}</strong></div><div>Total Occurrence: ${d.totalOccurrence}</div>`
          )
          .style("left", `${x}px`)
          .style("top", `${y - 28}px`);
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

    bubbleGroup.on("click", (event, d) => {
      onBubbleClick(d);
    });

    return () => {
      simulation.stop();
      d3.select(chartRef.current).select("svg").remove();
    };
  }, [chartRef, data]);
};

export default useBubbleChart;
