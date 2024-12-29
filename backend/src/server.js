const express = require("express");
const GPA = require("./services/gpa.js");

const app = express();
app.use(express.json());

let gpaCalculatorInstance; // Shared GPA instance to manage coursework data

// Initialize GPA instance on server start
(async () => {
  const filePath = "/Users/quantruong/portfol.io/backend/data/Results - IDA.html";
  gpaCalculatorInstance = await GPA.create(filePath);
})();

// GET endpoint to fetch all coursework
app.get("/api/coursework", (req, res) => {
  try {
    if (!gpaCalculatorInstance) {
      return res.status(500).json({ error: "GPA instance not initialized." });
    }
    const coursework = gpaCalculatorInstance.getAllClasses(); // Always pull the latest data
    res.status(200).json(coursework);
  } catch (error) {
    console.error("Error fetching coursework:", error);
    res.status(500).json({ error: "Failed to fetch coursework." });
  }
});

// POST endpoint to add a new course
app.post("/api/coursework", async (req, res) => {
  try {
    const { course, grade, isMajor } = req.body;
    if (!gpaCalculatorInstance) {
      return res.status(500).json({ error: "GPA instance not initialized." });
    }

    const addedCourse = await gpaCalculatorInstance.addCourse(course, grade, isMajor);

    if (addedCourse) {
      res.status(200).json({
        message: "Course added successfully.",
        course: addedCourse, // Return added course for immediate frontend updates
      });
    } else {
      res.status(400).json({ message: "Failed to add course. It may already exist." });
    }
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Failed to add course." });
  }
});

app.delete("/api/coursework/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!gpaCalculatorInstance) {
      return res.status(500).json({ error: "GPA instance not initialized." });
    }

    const removedCourse = await gpaCalculatorInstance.removeCourse(courseId);

    if (removedCourse) {
      res.status(200).json({
        message: "Course removed successfully.",
        course: removedCourse, // Return removed course for immediate frontend updates
      });
    } else {
      res.status(400).json({ message: "Failed to remove course." });
    }
  } catch (error) {
    console.error("Error removing course:", error);
    res.status(500).json({ error: "Failed to remove course." });
  }
});

app.post("/api/coursework/update-grade", async (req, res) => {
  const { courseId, grade } = req.body;
  if (!gpaCalculatorInstance) {
    return res.status(500).json({ error: "GPA instance not initialized." });
  }

  try {
    const updated = await gpaCalculatorInstance.updateGrade(courseId, grade);
    if (updated) {
      res.status(200).json({ message: "Grade updated successfully." });
    } else {
      res.status(404).json({ error: "Course not found or grade invalid." });
    }
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({ error: "Failed to update grade." });
  }
});


app.get("/api/gpa", (req, res) => {
  try {
    if (!gpaCalculatorInstance) {
      return res.status(500).json({ error: "GPA instance not initialized." });
    }

    const cumulativeGPA = gpaCalculatorInstance.calculateCumulativeGPA();
    const majorGPA = gpaCalculatorInstance.calculateMajorGPA();
    res.status(200).json({ cumulativeGPA, majorGPA });
  } catch (error) {
    console.error("Error calculating GPA:", error);
    res.status(500).json({ error: "Failed to calculate GPA." });
  }
});


const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
