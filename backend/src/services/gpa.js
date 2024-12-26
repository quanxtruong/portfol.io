
const fs = require('fs');
const {
    parseCoursework,
    parseMajorCourses,
    parseAllUTCourses,
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
            const courseworkCsvPath = await parseCoursework(filePath); // Generate coursework CSV
            const csvAbsolutePath = "/Users/quantruong/portfol.io/backend/data/" + courseworkCsvPath

            // Load coursework CSV into memory
            this.courseworkData = await this.loadCSV(csvAbsolutePath);
            // console.log(this.courseworkData)

            // Parse major courses
            this.majorCourses = parseMajorCourses(filePath);

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

    async loadCSV(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found: ${filePath}`);
        }

        return new Promise((resolve, reject) => {
            const records = [];
            fs.createReadStream(filePath)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
                .on('data', (row) => {
                    records.push(row); // Collect rows
                })
                .on('end', () => {
                    resolve(records); // Resolve with all rows
                })
                .on('error', (err) => {
                    reject(err); // Reject on error
                });
        });
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

            if (this.majorCourses.includes(course['Course Number'])) {
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
            .filter((course) => course.Type === "In-Residence")
            .map((course) => ({
            "Course ID": course["Course ID"], // Map to "Course ID"
            "Course Name": course["Course Name"], // Ensure this field exists in your data
            Grade: course.Grade,
            Unique: course.Unique,
            Type: course.Type,
            "Credit Hours": course["Credit Hours"],
            "Curriculum Flags": course["Curriculum Flags"] || "none", // Default to 'none' if missing
            "School(s) Enrolled": course["School(s) Enrolled"] || "N/A", // Default to 'N/A' if missing
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
            }));
    }

    addCourse(course, grade, isMajor) {
        let record = null;
        const upperCourse = course.toUpperCase();
        const upperGrade = grade.toUpperCase();
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
                        Grade: upperGrade || "",
                        Unique: record.Unique || "",
                        Type: record.Type || "In-Residence",
                        "Credit Hours": record['Credit Hours'] || "0",
                        "Curriculum Flags": record['Curriculum Flags'] || "none",
                        "School(s) Enrolled": record['School(s) Enrolled'] || "NASC",
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
    

    
}

module.exports = GPA;

if (require.main === module) {
    (async () => {
        const filePath = '/Users/quantruong/portfol.io/backend/data/Results - IDA.html'; // Replace with actual path
        const gpaCalculator = await GPA.create(filePath);
        await gpaCalculator.addCourse("M 340L", "A", false)
        console.log(gpaCalculator.getAllClasses())

        // console.log('Cumulative GPA:', gpaCalculator.calculateCumulativeGPA());
        // console.log('Major GPA:', gpaCalculator.calculateMajorGPA());
        // console.log('All Classes:', gpaCalculator.getAllClasses());
        // console.log('Major Classes:', gpaCalculator.getMajorClasses());
    })();
}