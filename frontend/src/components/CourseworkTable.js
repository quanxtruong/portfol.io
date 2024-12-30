import React, { useContext, useEffect } from "react";
import { CourseworkContext } from "../context/CourseworkContext";
import SemesterLabel from "./SemesterLabel";

const CourseworkTable = () => {
  const { coursework, fetchCoursework, updateCourseSemester, updateGrade, toggleMajor, removeCourse, groupBySemester } =
    useContext(CourseworkContext);

  useEffect(() => {
    fetchCoursework();
    // eslint-disable-next-line
  }, []);

  const groupedCoursework = groupBySemester(coursework);

  const handleDrop = (courseId, newSemester) => {
    updateCourseSemester(courseId, newSemester);
  };

  if (!coursework.length) {
    return <p>No coursework available or data is loading...</p>;
  }

  return (
    <div>
      <h2>Coursework</h2>
      {Object.entries(groupedCoursework).map(([semester, courses]) => (
        <SemesterLabel
          key={semester}
          semester={semester}
          courses={courses}
          onDrop={handleDrop}
          onGradeChange={updateGrade}
          onToggleMajor={toggleMajor}
          onRemove={removeCourse}
        />
      ))}
    </div>
  );
};

export default CourseworkTable;
