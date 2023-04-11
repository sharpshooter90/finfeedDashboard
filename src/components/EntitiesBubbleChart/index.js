import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import "./style.css";

const BubbleChart = ({ data, width, height }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && chartRef.current) {
      drawChart();
    }
  }, [data]);

  const createTooltip = () => {
    return d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");
  };

  const handleMouseOver = (svg, tooltip) => (event, d) => {
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    tooltip
      .style("visibility", "visible")
      .html(d.data.label)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 25 + "px");
  };

  const handleMouseOut = (svg, tooltip) => (event, d) => {
    d3.select(event.currentTarget).attr("stroke", null);
    tooltip.style("visibility", "hidden");
  };

  const drawLegend = (svg) => {
    const legendData = [
      { color: "#F39C12", label: "Neutral" },
      { color: "#27AE60", label: "Positive" },
      { color: "#E74C3C", label: "Negative" },
    ];

    const legend = svg.append("g").attr("class", "legend");
    // .attr("transform", `translate(${width / 2 - 60},${height + 20})`);

    const legendItems = legend
      .selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 90}, 0)`); // Increase spacing between legend items

    legendItems
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => d.color);

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text((d) => d.label);
  };

  const drawLabelLegend = (svg, data) => {
    const labelCounts = data.reduce((acc, item) => {
      acc[item.label] = (acc[item.label] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.entries(labelCounts).map(([label, count]) => ({
      label,
      count,
    }));

    const xOffset = 10;
    const yOffset = height + 60;

    const labelLegend = svg
      .append("g")
      .attr("class", "label-legend")
      .attr("transform", `translate(${xOffset},${yOffset})`);

    const labelItems = labelLegend
      .selectAll(".label-item")
      .data(labels)
      .enter()
      .append("g")
      .attr("class", "label-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    labelItems
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text((d) => `${d.label} (${d.count})`);
  };

  const drawBubbleChart = (svg, root, tooltip) => {
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
        if (d.data.positive_sentiment_percentage >= 50) {
          return "#27AE60"; // Positive (green)
        } else if (d.data.negative_sentiment_percentage >= 50) {
          return "#E74C3C"; // Negative (red)
        } else {
          return "#F39C12"; // Neutral (orange)
        }
      })
      .on("mouseover", (event, d) => handleMouseOver(svg, tooltip)(event, d))
      .on("mouseout", (event, d) => handleMouseOut(svg, tooltip)(event, d));

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

  const drawChart = () => {
    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height + 1060); // Increase height to accommodate the label legends

    svg.selectAll("*").remove();

    const pack = d3.pack().size([width, height]).padding(1.5);

    const root = d3
      .hierarchy({ children: data })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    pack(root);

    const tooltip = createTooltip();
    drawBubbleChart(svg, root, tooltip);
    drawLegend(svg);
    drawLabelLegend(svg, data);
  };

  return <svg ref={chartRef} />;
};

export default BubbleChart;
