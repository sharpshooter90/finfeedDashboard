// components/BubbleChart.js
import React, { useRef } from "react";
import Legend from "../Legend";
import useBubbleChart from "./useBubbleChart";
const BubbleChart = ({ data }) => {
  const chartRef = useRef();
  useBubbleChart(chartRef, data);

  return (
    <React.Fragment>
      <div ref={chartRef}></div>
      <Legend data={data} />
    </React.Fragment>
  );
};

export default BubbleChart;
