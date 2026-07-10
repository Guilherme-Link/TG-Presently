import "./AttendanceHeatmap (1).css";

const LEVEL_COUNT = 5;

function AttendanceHeatmap({ title, days, matrix }) {
  return (
    <div className="attendance-heatmap">
      <h3 className="attendance-heatmap__title">{title}</h3>

      <div className="attendance-heatmap__grid">
        {days.map((day) => (
          <span key={day} className="attendance-heatmap__day-label">
            {day}
          </span>
        ))}

        {matrix.map((row, rowIndex) =>
          row.map((level, colIndex) => (
            <span
              key={`${rowIndex}-${colIndex}`}
              className="attendance-heatmap__cell"
              data-level={Math.min(level, LEVEL_COUNT - 1)}
              title={`${days[colIndex]}: nível ${level}`}
            />
          )),
        )}
      </div>

      <div className="attendance-heatmap__legend">
        <span>Menor</span>
        {Array.from({ length: LEVEL_COUNT }).map((_, level) => (
          <span
            key={level}
            className="attendance-heatmap__legend-swatch"
            data-level={level}
          />
        ))}
        <span>Maior</span>
      </div>
    </div>
  );
}

export default AttendanceHeatmap;
