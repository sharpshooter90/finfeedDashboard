// components/BubbleChart.js
import React, { useRef } from "react";
import Legend from "../Legend";
import useBubbleChart from "./useBubbleChart";
const BubbleChart = ({ data, width, height }) => {
  const chartRef = useRef();
  useBubbleChart(chartRef, data, width, height);

  return (
    <React.Fragment>
      <div ref={chartRef}></div>
      <Legend data={data} />
    </React.Fragment>
  );
};

export default BubbleChart;
