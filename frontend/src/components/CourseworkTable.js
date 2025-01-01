import React, { useContext, useEffect } from "react";
import { CourseworkContext } from "../context/CourseworkContext";
import SemesterLabel from "./SemesterLabel";
import "../styles/CourseworkTable.css";

const CourseworkTable = () => {
  const {
    coursework,
    fetchCoursework,
    updateCourseSemester,
    updateGrade,
    toggleMajor,
    removeCourse,
    groupByAcademicYear,
  } = useContext(CourseworkContext);

  useEffect(() => {
    fetchCoursework();
    // eslint-disable-next-line
  }, []);

  const groupedByAcademicYear = groupByAcademicYear(coursework);

  const handleDrop = (courseId, newSemester) => {
    updateCourseSemester(courseId, newSemester);
  };

  const courseBank = coursework.filter(
    (course) => !course.Semester || course.Semester === "Course Bank"
  );

  return (
    <div className="coursework-grid">
      {/* Render the Course Bank */}
      <div className="course-bank-section">
        <h3>Course Bank</h3>
        <SemesterLabel
          semester="Course Bank"
          courses={courseBank}
          onDrop={handleDrop}
          onGradeChange={() => {}}
          onToggleMajor={() => {}}
          onRemove={removeCourse}
        />
      </div>
  
      {/* Render academic years */}
      {Object.entries(groupedByAcademicYear).map(([academicYear, semesters]) => (
        <div key={academicYear} className="academic-year-group">
          <h3>{academicYear}–{parseInt(academicYear, 10) + 1} Academic Year</h3>
          <div className="column-container">
            {["Fall", "Spring", "Summer"].map((semester) => {
              const semesterCourses = semesters[semester] || [];
              return semesterCourses.length > 0 ? (
                <div key={`${academicYear}-${semester}`} className="column">
                  <SemesterLabel
                    semester={`${semester} ${
                      semester === "Fall" ? academicYear : parseInt(academicYear, 10) + 1
                    }`}
                    courses={semesterCourses}
                    onDrop={handleDrop}
                    onGradeChange={updateGrade}
                    onToggleMajor={toggleMajor}
                    onRemove={removeCourse}
                  />
                </div>
              ) : null; // Only render if there are courses
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseworkTable;
