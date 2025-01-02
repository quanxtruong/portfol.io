import React, { useContext, useEffect, useRef, useCallback } from "react";
import { CourseworkContext } from "../context/CourseworkContext";
import SemesterLabel from "./SemesterLabel";
import "../styles/CourseworkTable.css";

const CourseworkTable = () => {
  const { coursework, fetchCoursework, updateCourseSemester, updateGrade, toggleMajor, removeCourse, groupByAcademicYear } = useContext(CourseworkContext);
  const scrollDirection = useRef(null); // Track scroll direction
  const scrollAnimationFrame = useRef(null); // Reference for requestAnimationFrame

  useEffect(() => {
    fetchCoursework();
    // eslint-disable-next-line
  }, []);

  const smoothScroll = useCallback(() => {
    const scrollSpeed = 5; // Adjust this for smoother/slower scrolling
    if (scrollDirection.current === "up") {
      window.scrollBy(0, -scrollSpeed);
    } else if (scrollDirection.current === "down") {
      window.scrollBy(0, scrollSpeed);
    }

    scrollAnimationFrame.current = requestAnimationFrame(smoothScroll);
  }, []); // No dependencies required, as the logic inside does not rely on changing values

  useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault();

      const scrollMargin = 50; // Pixels from the edge where auto-scroll starts
      const { clientY } = event;

      if (clientY < scrollMargin) {
        if (scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          cancelAnimationFrame(scrollAnimationFrame.current);
          scrollAnimationFrame.current = requestAnimationFrame(smoothScroll);
        }
      } else if (clientY > window.innerHeight - scrollMargin) {
        if (scrollDirection.current !== "down") {
          scrollDirection.current = "down";
          cancelAnimationFrame(scrollAnimationFrame.current);
          scrollAnimationFrame.current = requestAnimationFrame(smoothScroll);
        }
      } else {
        scrollDirection.current = null;
        cancelAnimationFrame(scrollAnimationFrame.current); // Stop scrolling when not near edges
      }
    };

    window.addEventListener("dragover", handleDragOver);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      cancelAnimationFrame(scrollAnimationFrame.current); // Cleanup on unmount
    };
  }, [smoothScroll]); // Include smoothScroll as a dependency

  const groupedByAcademicYear = groupByAcademicYear(coursework);

  const handleDrop = (courseId, newSemester) => {
    updateCourseSemester(courseId, newSemester);
  };

  return (
    <div className="coursework-grid">
      <div className="course-bank-section">
        <SemesterLabel
          semester="Course Bank"
          courses={coursework.filter((course) => !course.Semester || course.Semester === "Course Bank")}
          showHeaders={coursework.length > 0}
          onDrop={handleDrop}
          onGradeChange={updateGrade}
          onToggleMajor={toggleMajor}
          onRemove={removeCourse}
        />
      </div>
      {Object.entries(groupedByAcademicYear).map(([academicYear, semesters]) => (
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
                    semester={`${semester} ${semester === "Fall" ? academicYear : parseInt(academicYear, 10) + 1}`}
                    courses={semesterCourses}
                    showHeaders={true}
                    onDrop={handleDrop}
                    onGradeChange={updateGrade}
                    onToggleMajor={toggleMajor}
                    onRemove={removeCourse}
                  />
                </div>
              ) : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseworkTable;
