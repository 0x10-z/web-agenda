import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";

interface Data {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

const BarChart = () => {
  const [fromDate, setFromDate] = useState<Date>(new Date("2013-01-01"));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<Data>({
    labels: [],
    datasets: [
      {
        label: "Número de citas creadas",
        data: [],
      },
    ],
  });

  const fetchChartData = async () => {
    const response = await fetch(
      `http://localhost:5000/stats/appointment_count?date_from=${getFormattedDate(
        fromDate
      )}&date_to=${getFormattedDate(toDate)}`
    );
    const data = await response.json();

    const labels = data.map((d: any) => d.date);
    const values = data.map((d: any) => d.count);
    setChartData({
      ...chartData,
      labels: labels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: values,
        },
      ],
    });
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const handleToDateChange: ReactDatePickerProps["onChange"] = (date) => {
    setToDate(date as Date);
  };

  const handleFromDateChange: ReactDatePickerProps["onChange"] = (date) => {
    setFromDate(date as Date);
  };

  const handleDateChange = () => {
    if (fromDate && toDate) {
      fetchChartData();
    }
  };

  return (
    <div>
      <Bar
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
      <div className="flex flex-row space-x-6">
        <div className="flex flex-col">
          <label htmlFor="from-date-picker">Desde:</label>
          <DatePicker
            className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="from-date-picker"
            selected={fromDate}
            onChange={handleFromDateChange}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="to-date-picker">Hasta:</label>
          <DatePicker
            className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="to-date-picker"
            selected={toDate}
            onChange={handleToDateChange}
          />
        </div>

        <button
          className="px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleDateChange}
        >
          Actualizar gráfico
        </button>
      </div>
    </div>
  );
};

export default BarChart;

function getFormattedDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
