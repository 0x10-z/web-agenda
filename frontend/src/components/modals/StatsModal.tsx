import React, { useState } from "react";
import "chart.js";
import ModalBase from "components/modals/ModalBase";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, registerables } from "chart.js";
import BarChart from "components/charts/BarChart";
import LineChart from "components/charts/LineChart";
import Toggle from "react-toggle";
import "react-toggle/style.css";
ChartJS.register(...registerables);

interface StatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsProps> = ({ isOpen, onClose }) => {
  const [isLineChart, setIsLineChart] = useState(true);

  return (
    <ModalBase title="BI" isOpen={isOpen} onClose={onClose}>
      <div className="container mx-auto py-4">
        <div className="w-full">
          <div className="flex justify-center mb-4">
            <Toggle
              checked={isLineChart}
              onChange={() => setIsLineChart(!isLineChart)}
              name="Linea/Barras"
            />
          </div>
          {isLineChart ? <LineChart /> : <BarChart />}
        </div>
      </div>
    </ModalBase>
  );
};
