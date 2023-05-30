import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { ChartDataset } from "chart.js";

interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

interface Appointment {
  id: number;
  date: string;
  count: number;
}

const LineChart = () => {
  const labels = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const [chartData, setChartData] = useState<ChartData>({
    labels: labels,
    datasets: [],
  });

  useEffect(() => {
    (async () => {
      const appointments = await fetchAppointmentsData();
      const groupedAppointments = groupAppointmentsByYear(appointments);
      setChartData(groupedAppointments);
    })();
  }, []);

  return (
    <div>
      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Número de citas",
              font: {
                size: 20,
              },
            },
            legend: {
              position: "bottom",
            },
          },
        }}
      />
    </div>
  );
};

export default LineChart;

const fetchAppointmentsData = async (): Promise<Appointment[]> => {
  const response = await fetch("http://localhost:5000/stats/appointment_all");
  const data = await response.json();
  return data as Appointment[];
};

const groupAppointmentsByYear = (appointments: Appointment[]): ChartData => {
  const yearsData = appointments.reduce<Record<string, Appointment[]>>(
    (acc, cur) => {
      const year = new Date(cur.date).getFullYear().toString();

      if (!acc[year]) {
        acc[year] = [cur];
      } else {
        acc[year].push(cur);
      }

      return acc;
    },
    {}
  );

  const dataSets = Object.entries(yearsData).map(
    ([year, yearData], index, array) => {
      const datasetHidden = index < array.length - 4; // Establecer el valor de hidden en true excepto para los últimos 4

      return {
        label: year,
        data: yearData.map((d) => d.count),
        borderColor: getRandomColor(),
        fill: false,
        hidden: datasetHidden,
      };
    }
  );

  return {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: dataSets,
  };
};

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 1)`;
};
