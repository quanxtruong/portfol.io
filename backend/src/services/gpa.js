
const fs = require('fs');
const {
    parseCoursework,
    parseCSV,
} = require('./parser'); 
const { parse } = require('csv-parse');


const GRADE_POINTS = {
    "A": 4.0,
    "A-": 3.67,
    "B+": 3.33,
    "B": 3.0,
    "B-": 2.67,
    "C+": 2.33,
    "C": 2.0,
    "C-": 1.67,
    "D+": 1.33,
    "D": 1.0,
    "D-": 0.67,
    "F": 0.0
};

class GPA {
    constructor() {
        this.courseworkData = [];
        this.csvAbsolutePath = "";
        this.majorCourses = [];
        this.cumulativePoints = 0;
        this.cumulativeHours = 0;
        this.majorPoints = 0;
        this.majorHours = 0;
    }

    static async create(filePath) {
        const instance = new GPA(); // Create a new GPA instance
        await instance.init(filePath); // Asynchronously initialize the instance
        return instance; // Return the fully initialized instance
    }

    async init(filePath) {
        try {
            
            const [courseworkCsvPath, majorCourses] = await parseCoursework(filePath); // Generate coursework CSV
            this.csvAbsolutePath = "/Users/quantruong/portfol.io/backend/data/" + courseworkCsvPath
            this.majorCourses = majorCourses

            // Load coursework CSV into memory
            this.courseworkData = await parseCSV(this.csvAbsolutePath);
            // console.log(this.courseworkData)

           

            // Calculate points and hours
            const credits = this.getPointsAndHours();
            this.cumulativePoints = credits.cumulative.points;
            this.cumulativeHours = credits.cumulative.hours;
            this.majorPoints = credits.major.points;
            this.majorHours = credits.major.hours;
        } catch (error) {
            console.error(`Error initializing GPA: ${error.message}`);
        }
    }

    getPointsAndHours() {
        const pastCourses = this.courseworkData.filter(
            (course) =>
                course.Type === 'In-Residence' &&
                course.Grade &&
                course.Grade !== 'CR'
        );

        let cumulativePoints = 0,
            cumulativeHours = 0;
        let majorPoints = 0,
            majorHours = 0;

        pastCourses.forEach((course) => {
            const gradePoint = GRADE_POINTS[course.Grade];
            const creditHours = parseFloat(course['Credit Hours']) || 0;

            cumulativePoints += gradePoint * creditHours;
            cumulativeHours += creditHours;

            if (this.majorCourses.includes(course['Course ID'])) {
                majorPoints += gradePoint * creditHours;
                majorHours += creditHours;
            }
        });

        return {
            cumulative: { points: cumulativePoints, hours: cumulativeHours },
            major: { points: majorPoints, hours: majorHours }
        };
    }

    calculateCumulativeGPA() {
        if (!this.cumulativeHours) return 0.0;
        return Math.floor((this.cumulativePoints / this.cumulativeHours) * 10000) / 10000;
    }

    calculateMajorGPA() {
        if (!this.majorHours) return 0.0;
        return Math.floor((this.majorPoints / this.majorHours) * 10000) / 10000;
    }

    getAllClasses() {
        return this.courseworkData
            .filter((course) => (course.Type === "In-Residence" || course.Type === "Transfer") && course.Grade != "CR" )
            .map((course) => ({
            "Course ID": course["Course ID"], // Map to "Course ID"
            "Course Name": course["Course Name"], // Ensure this field exists in your data
            Grade: course.Grade,
            Unique: course.Unique,
            Type: course.Type,
            "Credit Hours": course["Credit Hours"],
            "Curriculum Flags": course["Curriculum Flags"] || "none", // Default to 'none' if missing
            "School(s) Enrolled": course["School(s) Enrolled"] || "N/A", // Default to 'N/A' if missing
            "Major Course": course["Major Course"] || "N/A",
            "Semester": course.Semester || ""
            }));
    }

    getMajorClasses() {
        const inResidenceCourses = this.courseworkData.filter(
            (course) => course.Type === 'In-Residence'
        );

        return inResidenceCourses
            .filter((course) => this.majorCourses.includes(course['Course ID']))
            .map((course) => ({
                "Course ID": course["Course ID"], // Map to "Course ID"
                "Course Name": course["Course Name"], // Ensure this field exists in your data
                Grade: course.Grade,
                Unique: course.Unique,
                Type: course.Type,
                "Credit Hours": course["Credit Hours"],
                "Curriculum Flags": course["Curriculum Flags"] || "none", // Default to 'none' if missing
                "School(s) Enrolled": course["School(s) Enrolled"] || "N/A", // Default to 'N/A' if missing
                "Major Course": course["Major Course"] || "N/A",
                "Semester": course.Semester || ""
            }));
    }

    addCourse(course, isMajor) {
        let record = null;
        const upperCourse = course.toUpperCase();
        const csvFilePath = '/Users/quantruong/portfol.io/backend/data/ut_courses.csv';
        const jsonFilePath = '/Users/quantruong/portfol.io/backend/data/coursework.json'; // Path to save data
    
        return new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
                .on('data', (row) => {
                    if (row['Course ID'] === upperCourse || row['Course Name'].toUpperCase() === upperCourse) {
                        record = row;
                    }
                })
                .on('end', () => {
                    if (record === null) {
                        console.log('Not a compatible UT Course.');
                        return resolve(false);
                    }
    
                    if (this.courseworkData.some(item => item['Course ID'] === record['Course ID'])) {
                        console.log("Duplicate Course.");
                        return resolve(false);
                    }

                    // Format the record
                    const formattedRecord = {
                        "Course ID": record['Course ID'],
                        "Course Name": record['Course Name'].toUpperCase(),
                        Grade: "",
                        Unique: record.Unique || "",
                        Type: record.Type || "In-Residence",
                        "Credit Hours": record['Credit Hours'] || "0",
                        "Curriculum Flags": record['Curriculum Flags'] || "none",
                        "School(s) Enrolled": record['School(s) Enrolled'] || "NASC",
                        "Major Course": isMajor ? "Yes" : "No",
                        "Semester": record.Semester || ""
                    };
    
                    this.courseworkData.push(formattedRecord); // Add to in-memory data
    
                    // Write updated courseworkData to file
                    fs.writeFile(jsonFilePath, JSON.stringify(this.courseworkData, null, 2), (err) => {
                        if (err) {
                            console.error("Error saving coursework data to file:", err);
                            return reject(err);
                        }
                        console.log("Coursework data saved to file.");
                        resolve(formattedRecord); // Resolve with the formatted record
                    });
                })
                .on('error', (err) => {
                    console.error('Error processing CSV:', err);
                    reject(err);
                });
        });
    }

    removeCourse(courseId) {

        const jsonFilePath = '/Users/quantruong/portfol.io/backend/data/coursework.json'; // Path to save data
        const course = this.courseworkData.find((c) => c["Course ID"] === courseId);
        if (!course) {
            return false; // Course not found
        }

        const creditHours = parseFloat(course["Credit Hours"]) || 0; // Ensure proper numeric handling
        this.courseworkData = this.courseworkData.filter((c) => c["Course ID"] !== courseId);

        if (course.Grade && course.Grade != "CR") {
            this.cumulativePoints -= GRADE_POINTS[course.Grade] * creditHours;
            this.cumulativeHours -= creditHours;
    
            if (course["Major Course"] === "Yes") {
                this.majorPoints -= GRADE_POINTS[course.Grade] * creditHours;
                this.majorHours -= creditHours;;
            }

        } 

        // Write updated courseworkData to file
        return new Promise((resolve, reject) => {
            fs.writeFile(jsonFilePath, JSON.stringify(this.courseworkData, null, 2), (err) => {
                if (err) {
                    console.error("Error saving coursework data to file:", err);
                    return reject(err);
                }
                console.log("Course removed and saved to file.");
                resolve(course); // Return the removed course data
            });
        });
    }

    updateGrade(courseId, grade) {
        const course = this.courseworkData.find((c) => c["Course ID"] === courseId);
        if (!course) {
            return false; // Course not found
        }

        if (course.Type != "In-Residence") {
            course.Grade = grade;
            return true;
        }
    
        const oldGradePoints = GRADE_POINTS[course.Grade] || 0;
        const creditHours = parseFloat(course["Credit Hours"]) || 0;
    
        if (grade === null || grade === "") {
            // Clear grade and update GPA
            if (course.Grade) { // Only subtract hours if a grade exists
                this.cumulativePoints -= oldGradePoints * creditHours;
                this.cumulativeHours -= creditHours;
    
                if (course["Major Course"] === "Yes") {
                    this.majorPoints -= oldGradePoints * creditHours;
                    this.majorHours -= creditHours;
                }
            }
            course.Grade = ""; // Clear the grade
        } else if (GRADE_POINTS[grade] !== undefined) {
            if (course.Grade === "" || course.Grade === null) {
                // Adding a grade for the first time
                this.cumulativeHours += creditHours;
                this.cumulativePoints += GRADE_POINTS[grade] * creditHours;
    
                if (course["Major Course"] === "Yes") {
                    this.majorHours += creditHours;
                    this.majorPoints += GRADE_POINTS[grade] * creditHours;
                }
            } else {
                // Replacing an existing grade
                this.cumulativePoints += (GRADE_POINTS[grade] - oldGradePoints) * creditHours;
                if (course["Major Course"] === "Yes") {
                    this.majorPoints += (GRADE_POINTS[grade] - oldGradePoints) * creditHours;
                }
            }
    
            course.Grade = grade; // Update the grade
        } else {
            return false; // Invalid grade
        }
    
        return true; // Update successful
    }

    updateSemester(courseId, newSemester) {
        const course = this.courseworkData.find((c) => c["Course ID"] === courseId);
        if (!course) {
          return false; // Course not found
        }
      
        course.Semester = newSemester;
      
        // Optionally save changes to JSON file or database
        const jsonFilePath = '/Users/quantruong/portfol.io/backend/data/coursework.json';
        fs.writeFileSync(jsonFilePath, JSON.stringify(this.courseworkData, null, 2));
        
        return true; // Update successful
      }

    toggleMajor(courseId) {
        const course = this.courseworkData.find((c) => c["Course ID"] === courseId);
        if (!course) {
          return false; // Course not found
        }
      
        const creditHours = parseFloat(course["Credit Hours"]) || 0;
        const gradePoints = GRADE_POINTS[course.Grade] || 0;
        
        if (course["Major Course"] === "Yes") {
            // Remove from major courses
            if (course.Grade) {
                this.majorPoints -= gradePoints * creditHours;
                this.majorHours -= creditHours;
            }
            course["Major Course"] = "No";

        } else {
            // Add to major courses
            if (course.Grade) {
                this.majorPoints += gradePoints * creditHours;
                this.majorHours += creditHours;
            }
            course["Major Course"] = "Yes";
        }
        
      
        return true;
      }

    async resetCourses() {
        try {
            // Parse the CSV file
            this.courseworkData = await parseCSV(this.csvAbsolutePath);

            // Recalculate GPA-related fields
            const credits = this.getPointsAndHours();
            this.cumulativePoints = credits.cumulative.points;
            this.cumulativeHours = credits.cumulative.hours;
            this.majorPoints = credits.major.points;
            this.majorHours = credits.major.hours;

            console.log("Courses have been reset successfully.");
        } catch (error) {
            console.error("Error resetting courses:", error.message);
        }
    }
      
    
}

module.exports = GPA