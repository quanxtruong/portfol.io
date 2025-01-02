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
    // Update the semester first
    updateCourseSemester(courseId, newSemester);
  };

  const courseBank = coursework.filter(
    (course) => !course.Semester || course.Semester === "Course Bank"
  );

  return (
    <div className="coursework-grid">
      {/* Always render the Course Bank */}
      <div className="course-bank-section">
        <SemesterLabel
          semester="Course Bank"
          courses={courseBank}
          showHeaders={courseBank.length > 0} // Show headers only if courses exist
          onDrop={handleDrop}
          onGradeChange={updateGrade}
          onToggleMajor={toggleMajor}
          onRemove={removeCourse}
        />
      </div>

      {/* Render academic years */}
      {Object.entries(groupedByAcademicYear).map(
        ([academicYear, semesters]) => (
          <div key={academicYear} className="academic-year-group">
            <h3>
              {academicYear}–{parseInt(academicYear, 10) + 1} Academic Year
            </h3>
            <div className="column-container">
              {["Fall", "Spring", "Summer"].map((semester) => {
                const semesterCourses = semesters[semester] || [];
                return semesterCourses.length > 0 ? (
                  <div key={`${academicYear}-${semester}`} className="column">
                    <SemesterLabel
                      semester={`${semester} ${
                        semester === "Fall"
                          ? academicYear
                          : parseInt(academicYear, 10) + 1
                      }`}
                      courses={semesterCourses}
                      showHeaders={true} // Always show headers for semesters
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
        )
      )}
    </div>
  );
};

export default CourseworkTable;
