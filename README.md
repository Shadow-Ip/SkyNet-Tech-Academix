# SkyNet Tech Acdemix 

SkyNet Tech Academix is a web-based Student Registration and Academic Management System developed to efficiently manage student records within an academic environment. The system features a clean, Material Design–inspired user interface and a secure backend built with PHP and MySQL. It is designed to support administrative tasks while providing students with access to their academic information in a structured and reliable manner.

The application enables administrators to register students through a structured HTML5 form that collects essential academic and personal details, including full name, student identification number, email address, date of birth, course of study, and enrollment date. Form submissions are processed using PHP, where inputs are validated, errors are handled appropriately, and data is securely stored in a MySQL database using prepared statements to protect against SQL injection.

SkyNet Tech Academix includes a student management dashboard accessible to administrators, which allows them to view, update, and delete student records stored in the database. Student data is dynamically retrieved and displayed in a tabular format using PHP and JavaScript. The system supports searching, sorting, and filtering of records to improve usability and efficiency, while delete actions are protected by confirmation prompts to prevent accidental data loss.

Each student has a dynamically generated profile page that can be accessed by both administrators and students. The profile page displays personal information, enrolled course details, and academic status indicators, all retrieved through PHP functions and URL parameters. Updates made by administrators are reflected in real time, ensuring data consistency across the system.

The system also provides reporting functionality for students, including a profile summary report and a registration confirmation slip. These reports present key academic information such as registration details, enrollment status, and timestamps, and can be viewed online or downloaded in a printable HTML or PDF format.

Security is a core consideration throughout the system. The application implements prepared SQL statements, input validation, structured error handling, and secure file processing. When student records are deleted, relevant information is logged to a file to support auditing and recovery tracking.

This project demonstrates my practical knowledge of web development technologies including PHP programming, MySQL operations, JavaScript, and modern frontend design principles. It also reflects my understanding of scalable system design, with exposure to React, Node.js, and React Native concepts for potential future expansion to mobile platforms. SkyNet Tech Academix was developed for educational and portfolio purposes, showcasing secure backend development, database-driven applications, and clean user interface design.
