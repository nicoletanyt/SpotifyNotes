import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

const PieChart = (playlist) => {
  ChartJS.register(ArcElement, Tooltip, Legend);
  let diagram = {};
  let data = {};

  for (let i = 0; i < playlist.length; i++) {
    let key = JSON.stringify(playlist[i]);
    let value = 0;
    if (diagram[key] != null) {
      value = diagram[key] + 1;
    } else {
      value = 1;
    }
    diagram[key] = value;
  }

  let diagram_labels = []
  for (let i = 0; i < Object.keys(diagram).length; i++) {
    diagram_labels.push(JSON.parse(Object.keys(diagram)[i]).name)
  }
  console.log(diagram)
  data = {
    labels: diagram_labels,
    datasets: [
      {
        label: "number of times",
        data: Object.values(diagram),
        backgroundColor: [
          "blue",
        ],
      },
    ],
  };

  console.log(data);

  return (
    <div className="chart-wrapper">
        <Pie className="chart" data={data} />
    </div>
    // <canvas id="myChart" style="width:100%;max-width:700px"></canvas>
    // <div className="pie-wrap">
    //   {Object.keys(diagram).map((song) => (
    //     <div className="quadrant">
    //         <p key={JSON.parse(song).id} className="quadrant"> {JSON.parse(song).name}: {diagram[song]}{" "} </p>
    //     </div>
    //   ))}

    // </div>
  );
};

export default PieChart;
