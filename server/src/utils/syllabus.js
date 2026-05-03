/**
 * DCRUST Syllabus Mapping Utility
 * Maps Subject Codes to Unit-wise Details for AI Grounding
 */

export const SYLLABUS_MAP = {
  // B.Tech Common (1st Year)
  "HUM101C": { name: "English Language Skills", units: ["Basics of Communication", "Oral Communication", "Written Communication", "Language Skills"] },
  "MATH101C": { name: "Mathematics - I", units: ["Calculus", "Multivariable Calculus", "Sequences & Series", "Vector Calculus"] },
  "CH101C": { name: "Engineering Chemistry", units: ["Atomic & Molecular Structure", "Periodic Properties", "Intermolecular Forces", "Spectroscopy"] },
  "EE101C": { name: "Basic Electrical Engineering", units: ["DC Circuits", "AC Circuits", "Transformers", "Electrical Machines"] },
  "CSE101C": { name: "Programming for Problem Solving", units: ["Intro to Programming", "Arithmetic Expressions", "Arrays & Functions", "Recursion & Pointers"] },
  "ME101C": { name: "Engineering Graphics & Design", units: ["Introduction", "Orthographic Projections", "Projections of Solids", "Sections of Solids"] },

  // BCA Curriculum (Session 2020-21 onwards)
  "BCA101C": { 
    name: "Introduction to Computer & IT", 
    units: ["Basics of Computer & Architecture", "Operating System Concepts", "Communication & Internet", "MS Office (Word, PPT, Excel)"] 
  },
  "BCA103C": { 
    name: "Programming in 'C'", 
    units: ["Programming Process & Basics", "Control Structures (Loops, Switch)", "Arrays, Strings & Functions", "Structures, Unions & Pointers"] 
  },
  "MATHS101C": { 
    name: "Mathematics-I", 
    units: ["Sets, Relations & Functions", "Matrices & Determinants", "Sequence & Series", "Basic Statistics (Mean, Median, SD)"] 
  },
  "HUMT101C": { 
    name: "Communication Skill-I", 
    units: ["Basics & Theories of Communication", "Oral Communication & Listening", "Written Communication & Reports", "Language Skills (Grammar)"] 
  },
  "BCA102C": { 
    name: "Digital Design", 
    units: ["Information Representation", "Binary Logic & Simplification", "Digital Logic Gates", "Combinational & Sequential Circuits"] 
  },
  "BCA104C": { 
    name: "Data Structure using C", 
    units: ["Introduction & Complexity", "Arrays & Linked Lists", "Stacks & Queues", "Trees & Graphs"] 
  },
  "BCA106C": { 
    name: "Data Base Management System", 
    units: ["Basic Concepts & Components", "Architecture & Data Independence", "Data Models (ER, Relational)", "SQL, Transactions & Concurrency"] 
  },
  "MATHS102C": { 
    name: "Mathematics-II", 
    units: ["Limits & Continuity", "Probability & Baye's Theorem", "Correlation & Regression", "Co-ordinate Geometry"] 
  },
  "HUMT102C": { 
    name: "Communication Skill-II", 
    units: ["Vocabulary & Technology Terms", "Nonverbal & Business Etiquettes", "Project Presentations", "Job Application & Interviews"] 
  },
  "BCA201C": { 
    name: "Computer System Architecture", 
    units: ["CPU & Micro-operations", "Instructions & Addressing Modes", "I/O Organization", "Memory Organization"] 
  },
  "BCA203C": { 
    name: "Object Oriented Programming using C++", 
    units: ["Intro & Syntax", "Classes & Objects", "Inheritance & Polymorphism", "Generic Programming & Files"] 
  },
  "BCA205C": { 
    name: "Operating System", 
    units: ["OS Objectives & Evolution", "Process & CPU Scheduling", "Concurrency & Memory Management", "I/O & File Management"] 
  },
  "BCA207C": { 
    name: "Web Technology", 
    units: ["HTML Basics", "Forms & CSS", "JavaScript Scripting", "Web Hosting & Testing"] 
  },
  "BCA202C": { 
    name: "Data Communication & Networking", 
    units: ["Networking Basics & OSI", "Physical & Data Link Layer", "Network & Transport Layer", "Application Layer & Security"] 
  },
  "BCA206C": { 
    name: "Relational Database Management System", 
    units: ["Relational Model & Algebra", "Normalization (1NF, 2NF, 3NF, BCNF)", "Advanced SQL", "PL/SQL Blocks & Triggers"] 
  },
  "BCA208C": { 
    name: "Core JAVA", 
    units: ["Java Basics & JVM", "OOP in Java", "Interface & Exception Handling", "Multithreading & GUI (Swing)"] 
  },
  "BCA210C": { 
    name: "Software Engineering", 
    units: ["SDLC Models", "Project Planning & Design", "Software Testing", "Maintenance & Quality"] 
  },
  "BCA301C": { 
    name: "Advance Java", 
    units: ["GUI & Event Handling", "Collections & JDBC", "Web Dev (Servlet)", "Java Server Pages (JSP)"] 
  },
  "BCA303C": { 
    name: "Software Project Management", 
    units: ["SPM Basics & Planning", "Evaluation & Estimation", "Resource Allocation", "Quality & Testing"] 
  },
  "BCA302C": { 
    name: "Python Programming", 
    units: ["Intro & Data Types", "Data Structures", "Subroutines & Files", "OOP in Python"] 
  },
  "BCA304C": { 
    name: "Introduction to Data Science", 
    units: ["Data Science Intro", "Cleaning & Preprocessing", "Exploratory Data Analysis", "ML Algorithms Intro"] 
  },

  // B.Tech Mechanical Engineering (Sample)
  "ME201C": { name: "Thermodynamics", units: ["First Law of Thermodynamics", "Second Law of Thermodynamics", "Properties of Pure Substances", "Thermodynamic Cycles"] },
  "ME203C": { name: "Strength of Materials", units: ["Stress & Strain", "Bending of Beams", "Torsion of Shafts", "Columns & Struts"] },
  "ME205C": { name: "Engineering Mechanics", units: ["Statics of Particles", "Equilibrium of Rigid Bodies", "Centroid & Moment of Inertia", "Dynamics"] },
  "ME301C": { name: "Heat Transfer", units: ["Conduction", "Convection", "Radiation", "Heat Exchangers"] },
  "ME303C": { name: "Machine Design", units: ["Design for Static Loading", "Design for Fatigue", "Shafts & Couplings", "Gears & Bearings"] }
};

/**
 * Helper to get subject info by code
 */
export const getSubjectInfo = (code) => {
  if (!code) return null;
  const normalizedCode = code.toUpperCase().replace(/\s+/g, '');
  return SYLLABUS_MAP[normalizedCode] || null;
};
