import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

const BubbleChart = ({ data, width, height }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && chartRef.current) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const pack = d3.pack().size([width, height]).padding(1.5);

    const root = d3
      .hierarchy({ children: data })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    pack(root);

    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);
    nodes
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => {
        const positive = d.data.positive_sentiment_percentage;
        const negative = d.data.negative_sentiment_percentage;

        if (positive >= negative) {
          return positive === 0 && negative === 0 ? "orange" : "green";
        } else {
          return "red";
        }
      })
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        svg
          .append("text")
          .attr("id", "label")
          .attr("x", d.x)
          .attr("y", d.y + d.r + 10)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .text(d.data.label);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", null);

        svg.select("#label").remove();
      });

    nodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text((d) => {
        const label = d.data.label;
        const maxChars = Math.floor(d.r / 8); // adjust the divisor to your liking
        if (label.length > maxChars) {
          return label.slice(0, maxChars - 3) + "...";
        }
        return label;
      });
  };

  return <svg ref={chartRef} />;
};

export default BubbleChart;
