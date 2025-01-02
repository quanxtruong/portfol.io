import React from "react";
import { useDrag } from "react-dnd";
import "../styles/CourseworkRow.css";

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
      className="coursework-row"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <td>{course["Course ID"]}</td>
      <td className="course-name" title={course["Course Name"]}>
        {course["Course Name"]}
      </td>
      <td className="grade">
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
        <button
          onClick={() => onRemove(course["Course ID"])}
          className="action-button"
        >
          X
        </button>
      </td>
    </tr>
  );
};

export default CourseworkRow;
