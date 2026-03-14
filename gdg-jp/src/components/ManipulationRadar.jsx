import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

export default function ManipulationRadar({ data }) {

  const chartData = [
    { subject: "Fear", value: data.fear },
    { subject: "Urgency", value: data.urgency },
    { subject: "Polarization", value: data.polarization },
    { subject: "Authority", value: data.authority },
    { subject: "Emotion", value: data.emotion }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#444" />
        <PolarAngleAxis dataKey="subject" stroke="#aaa" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          dataKey="value"
          stroke="#14b8a6"
          fill="#14b8a6"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}