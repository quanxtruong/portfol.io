const fs = require('fs');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Axios instance with custom settings
const axiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
});

// Utility: Sleep function
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility: Fetch with retry logic
async function fetchWithRetry(url, retries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempting to fetch: ${url} (Attempt ${attempt}/${retries})`);
            const response = await axiosInstance.get(url);
            console.log(`Successfully fetched: ${url}`);
            return response;
        } catch (err) {
            console.error(`Failed to fetch: ${url} (Attempt ${attempt}/${retries}) - ${err.message}`);

            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await sleep(delay);
            } else {
                console.error(`Exhausted all retries for: ${url}`);
                throw err;
            }
        }
    }
}

// Parse coursework from HTML
async function parseCoursework(filePath) {
  try {
    // Read and decode HTML file
    const fileBuffer = fs.readFileSync(filePath);
    const htmlContent = iconv.decode(fileBuffer, "iso-8859-1");
    const $ = cheerio.load(htmlContent);

    // Parse major courses
    const major_courses = parseMajorCourses(filePath) || []; // Ensure it is an array

    // Extract coursework table rows
    const coursework = $("#coursework");
    const rows = coursework.find("tr").not(".alias");
    const data = [];

    rows.each((_, row) => {
      const columns = $(row).find("td");
      if (columns.length) {
        const rowData = [];
        columns.each((_, col) => {
          rowData.push($(col).text().trim());
        });
        if (rowData.length === 8) {
          data.push(rowData);
        }
      }
    });

    // Define CSV headers
    const headers = [
      { id: "course_id", title: "Course ID" },
      { id: "course_name", title: "Course Name" },
      { id: "grade", title: "Grade" },
      { id: "unique", title: "Unique" },
      { id: "type", title: "Type" },
      { id: "credit_hours", title: "Credit Hours" },
      { id: "curriculum_flags", title: "Curriculum Flags" },
      { id: "schools_enrolled", title: "School(s) Enrolled" },
      { id: "is_major", title: "Major Course" },
    ];


    // Format data for CSV
    const formattedData = data.map((row) => {
      const formattedCourseID = row[0].replace(/\s+/g, " ").toUpperCase(); // Trim extra spaces
      return {
        course_id: formattedCourseID,
        course_name: row[1],
        grade: row[2],
        unique: row[3],
        type: row[4],
        credit_hours: row[5],
        curriculum_flags: row[6],
        schools_enrolled: row[7],
        is_major: major_courses.includes(formattedCourseID)? "Yes" : "No",
      };
    });

    // Write to CSV
    const csvWriter = createCsvWriter({
      path: '/Users/quantruong/portfol.io/backend/data/coursework.csv', // Use environment variable for flexibility
      header: headers,
    });

    await csvWriter.writeRecords(formattedData);
    console.log("Coursework CSV successfully written.");
    return ["coursework.csv", major_courses];
  } catch (error) {
    console.error("Error parsing coursework:", error.message);
    throw error; // Re-throw error to allow higher-level handling
  }
}


// Parse major courses from HTML
function parseMajorCourses(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const htmlContent = iconv.decode(fileBuffer, 'iso-8859-1');
    const $ = cheerio.load(htmlContent);

    const majorCourses = [];
    let majorSection = null;

    const allSectionTitles = $('.results .section_title');
    allSectionTitles.each((_, title) => {
        if ($(title).text().includes('Major')) {
            majorSection = $(title).closest('table.results');
            return false;
        }
    });

    if (majorSection) {
        const ruleRows = majorSection.find('tbody.section > tr.rule');
        ruleRows.each((_, rule) => {
            const detailsRow = $(rule).next('tr.details');
            if (detailsRow.length) {
                const courseTable = detailsRow.find('table');
                if (courseTable.length) {
                    const courseRows = courseTable.find('tr').slice(1);
                    courseRows.each((_, cRow) => {
                        const cells = $(cRow).find('td');
                        if (cells.length) {
                            const courseId = $(cells[0]).text().trim().replace(/\s+/g, ' ');
                            majorCourses.push(courseId);
                        }
                    });
                }
            }
        });
    }

    return majorCourses;
}

// Fetch main page and extract links
async function fetchMainPage(baseUrl) {
    console.log(`Fetching main page: ${baseUrl}`);
    const response = await fetchWithRetry(baseUrl, 3, 2000);
    const $ = cheerio.load(response.data);

    const links = $('a[href]');
    const courseLinks = [];
    links.each((_, link) => {
        const href = $(link).attr('href');
        if (href && href.includes('/coursesatoz/') && href !== '/general-information/coursesatoz/') {
            courseLinks.push(baseUrl + href);
        }
    });

    console.log(`Found ${courseLinks.length} department links.`);
    return courseLinks;
}

// Parse department courses
async function parseDepartment(link, index, total) {
    console.log(`Scraping department ${index + 1}/${total}: ${link}`);
    const response = await fetchWithRetry(link, 3, 2000);
    const $ = cheerio.load(response.data);

    const courseTitles = $('h5');
    const departmentCourses = [];

    courseTitles.each((_, course) => {
        const fullTitle = $(course).text().trim();
        try {
            const parts = fullTitle.split('. ', 2);
            if (parts.length !== 2) return;

            const [courseIdsPart, courseNameRaw] = parts;
            const courseName = courseNameRaw.trim().replace(/\.$/, '');
            const courseIdVariants = courseIdsPart.includes(',')
                ? courseIdsPart.split(',').map((cid) => cid.trim())
                : [courseIdsPart.trim()];

            const firstVariant = courseIdVariants[0];
            const cleanedFirstVariant = firstVariant.replace(/\s+/g, ' ').trim();
            const firstVariantParts = cleanedFirstVariant.split(' ');
            const department = firstVariantParts.slice(0, -1).join(' ');

            courseIdVariants.forEach((variant) => {
                const cleanedVariant = variant.replace(/\s+/g, ' ').trim();
                const variantParts = cleanedVariant.split(' ');

                const fullCourseId =
                    variantParts.length === 1
                        ? `${department} ${variantParts[0]}`
                        : cleanedVariant;

                const lastPart = fullCourseId.split(' ').pop();
                const creditHoursMatch = lastPart.match(/(\d)/);
                const creditHours = creditHoursMatch ? parseInt(creditHoursMatch[1], 10) : null;

                departmentCourses.push({
                    course_id: fullCourseId,
                    course_name: courseName,
                    department,
                    credit_hours: creditHours,
                    type: 'In-Residence',
                });
            });
        } catch (err) {
            console.error(`Error parsing title: ${fullTitle} - ${err.message}`);
        }
    });

    console.log(`Finished scraping department ${index + 1}/${total}. Parsed ${departmentCourses.length} courses.`);
    return departmentCourses;
}

// Parse all courses at UT
async function parseAllUTCourses(baseUrl) {
    try {
        console.log('Starting the scraping process...');
        const courseData = [];
        const courseLinks = await fetchMainPage(baseUrl);

        for (const [index, link] of courseLinks.entries()) {
            const departmentCourses = await parseDepartment(link, index, courseLinks.length);
            courseData.push(...departmentCourses);
            console.log(`Progress: ${index + 1}/${courseLinks.length} departments scraped.`);
        }

        console.log('All departments scraped. Preparing to save data to CSV...');
        const csvWriter = createCsvWriter({
            path: "../../data/ut_courses.csv",
            header: [
                { id: 'course_id', title: 'Course ID' },
                { id: 'course_name', title: 'Course Name' },
                { id: 'department', title: 'Department' },
                { id: 'credit_hours', title: 'Credit Hours' },
                { id: 'type', title: 'Type' },
            ],
        });

        await csvWriter.writeRecords(courseData);
        console.log(`Course data saved successfully to ut_courses.csv`);
    } catch (err) {
        console.error('Error during the scraping process:', err.message);
    }
}

// Export functions as a plain module
module.exports = {
    parseCoursework,
    parseMajorCourses,
    fetchMainPage,
    parseDepartment,
    parseAllUTCourses,
};
