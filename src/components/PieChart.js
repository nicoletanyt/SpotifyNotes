import React, { useState, useEffect } from "react";
// import { Chart, ArcElement, Tooltip, Legend } from "react-chartjs-2";
import { Chart, registerables, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { ref, set, child, get } from "firebase/database";


const PieChart = ({ userID, database }) => {
  
  let diagram = {};
  let diagram_labels = [];
  let quadrant_label = [];
  const [playlist, setPlaylist] = useState(null)
  const [data, setData] = useState(null)
  const [created, setCreated] = useState(false)
  let options = {}
  
  useEffect(() => {
    Chart.register(ArcElement, Tooltip, Legend);
    Chart.register(ChartDataLabels);
    Chart.register(...registerables);

    get(child(ref(database), `users/${userID}`))
      .then((snapshot) => {
        console.log("got data");
        if (snapshot.exists()) {
            setPlaylist(snapshot.val())
            console.log(playlist)
            console.log("confirmed")
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
          
          console.log(diagram_labels)

          setData({
            labels: diagram_labels,
            datasets: [
              {
                label: "Number of Votes",
                data: Object.values(diagram),
                datalabels: {
                  // labels: diagram_labels,
                },
              },
            ],
          });
    }
    if (!created && data != null) {
      console.log("Created")
      createChart(data);
      setCreated(true)
    }

  }, [playlist]);


  function createChart(data) {
      new Chart(document.getElementById("chart-0"), {
        type: "pie",
        data: data,
        plugins: [ChartDataLabels],
        options: {
          plugins: {
            datalabels: {
              formatter: function(value, context) {
                return context.chart.data.labels[context.dataIndex];
              },
              labels: {
                value: {
                  data: diagram_labels,
                  color: "#FFFF"
                }
              }
            }
        },
        },
        responsive: true,
        maintainAspectRatio: false,
      });
    }

  return (
    <div className="chart-wrapper">
        <canvas id="chart-0"></canvas>
    </div>
  );
};

export default PieChart;
