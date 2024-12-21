
const fs = require('fs');
const path = require('path');
const {
    parseCoursework,
    parseMajorCourses,
} = require('./parser'); 
const { parse } = require('csv-parse/sync');


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
    constructor(filePath) {
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
            const csvAbsolutePath = path.resolve(__dirname, '../../data', courseworkCsvPath);

            // Load coursework CSV into memory
            this.courseworkData = this.loadCSV(csvAbsolutePath);
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

    loadCSV(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found: ${filePath}`);
        }
    
        const fileContent = fs.readFileSync(filePath, 'utf8');
    
        // Let csv-parse handle quoted fields, commas, etc.
        const records = parse(fileContent, {
            columns: true,         // Use the first row as column headers
            skip_empty_lines: true // Ignore empty lines
        });
    
        return records;
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
        const inResidenceCourses = this.courseworkData.filter(
            (course) => course.Type === 'In-Residence'
        );
        return inResidenceCourses;
    }

    getMajorClasses() {
        const inResidenceCourses = this.courseworkData.filter(
            (course) => course.Type === 'In-Residence'
        );
        const majorCourses = inResidenceCourses.filter((course) =>
            this.majorCourses.includes(course['Course Number'])
        );
        return majorCourses;
    }
}

module.exports = GPA;

if (require.main === module) {
    (async () => {
        const filePath = '/Users/quantruong/portfol.io/backend/data/Results - IDA.html'; // Replace with actual path
        const gpaCalculator = await GPA.create(filePath);

        console.log('Cumulative GPA:', gpaCalculator.calculateCumulativeGPA());
        console.log('Major GPA:', gpaCalculator.calculateMajorGPA());
        // console.log('All Classes:', gpaCalculator.getAllClasses());
        // console.log('Major Classes:', gpaCalculator.getMajorClasses());
    })();
}