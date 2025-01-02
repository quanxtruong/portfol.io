import React from "react";
import { useDrop } from "react-dnd";
import CourseworkRow from "./CourseworkRow";
import "../styles/SemesterLabel.css";

const SemesterLabel = ({
  semester,
  courses,
  onDrop,
  onGradeChange,
  onToggleMajor,
  onRemove,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COURSEWORK",
    drop: (item) => onDrop(item.courseId, semester),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className={`semester-label ${isOver ? "is-over" : ""}`} ref={drop}>
      <h3>{semester}</h3>
      <table className="semester-table" border="1">
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Grade</th>
            <th>Credit Hours</th>
            <th>Type</th>
            <th>Major Course</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <CourseworkRow
              key={course["Course ID"]}
              course={course}
              onGradeChange={onGradeChange}
              onToggleMajor={onToggleMajor}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SemesterLabel;
