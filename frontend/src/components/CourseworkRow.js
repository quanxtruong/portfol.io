import React from "react";
import { useDrag } from "react-dnd";

const CourseworkRow = ({ course, onGradeChange, onToggleMajor, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COURSEWORK",
    item: { courseId: course["Course ID"] },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <tr
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        backgroundColor: isDragging ? "#f0f0f0" : "white",
      }}
    >
      <td>{course["Course ID"]}</td>
      <td>{course["Course Name"]}</td>
      <td>
        <input
          type="text"
          value={course.Grade || ""}
          onChange={(e) => onGradeChange(course["Course ID"], e.target.value)}
          placeholder="Enter grade"
        />
      </td>
      <td>{course["Credit Hours"]}</td>
      <td>{course.Type}</td>
      <td>
        <input
          type="checkbox"
          checked={course["Major Course"] === "Yes"}
          onChange={() => onToggleMajor(course["Course ID"])}
        />
      </td>
      <td>
        <button onClick={() => onRemove(course["Course ID"])}>Remove</button>
      </td>
    </tr>
  );
};

export default CourseworkRow;
