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
      .attr("width", width)
      .attr("height", height);

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

    const simulation = d3
      .forceSimulation(flattenedData)
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => radiusScale(d.totalOccurrence))
      )
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
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<div><strong>${d.label}</strong></div><div>Total Occurrence: ${d.totalOccurrence}</div>`
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
