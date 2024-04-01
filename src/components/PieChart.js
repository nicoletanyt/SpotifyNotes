import React, { useState, useEffect } from "react";
import { Chart, registerables, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

const PieChart = ({ playlist }) => {
  let diagram = {};
  let diagram_labels = [];
  const [data, setData] = useState(null);
  const [created, setCreated] = useState(false);
  const [options, setOptions] = useState(null);

  Chart.register(ArcElement, Tooltip, Legend);
  Chart.register(ChartDataLabels);
  Chart.register(...registerables);

  useEffect(() => {
    if (playlist != null) {
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

      for (let i = 0; i < Object.keys(diagram).length; i++) {
        diagram_labels.push(JSON.parse(Object.keys(diagram)[i]).name);
      }

      console.log(diagram_labels);

      setData({
        labels: diagram_labels,
        datasets: [
          {
            label: "Number of Votes",
            data: Object.values(diagram),
          },
        ],
      });
    }
    if (data != null && !created) {
      console.log("Created");
      setCreated(true);
      setOptions({
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex].split(" ");
            },
            padding: 10,
            labels: {
              value: {
                data: diagram_labels,
                color: "#FFFF",
              },
            },
          },
          legend: {
            position: "right",
            title: {
              display: true,
              text: "Tracks",
            }
          }
        },
      });
    }
  }, [playlist]);

  return (
    <div className="chart-wrapper">
      {data != null && (
        <Pie
          id="chart-0"
          data={data}
          plugins={[ChartDataLabels]}
          options={options}
        />
      )}
    </div>
  );
};

export default PieChart;
