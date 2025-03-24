export interface Student {
  id: string;
  name: string;
  contactNumber: string;
  dateOfBirth: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  emergencyContact?: string;
  enrollmentDate?: string;
  class?: string;
  notes?: string;
}

export interface FeeEntry {
  id: string;
  studentId: string;
  registrationFee: number;
  admissionFee: number;
  annualCharges: number;
  monthlyFees: MonthlyFee[];
  deposits: Deposit[];
}

export interface MonthlyFee {
  id: string;
  month: string; // Format: "YYYY-MM"
  amount: number;
  paid: boolean;
}

export interface Deposit {
  id: string;
  amount: number;
  date: string;
  remarks?: string;
}

export interface Class {
  id: string;
  name: string;
  capacity: number;
  teacher?: string;
  description?: string;
}

// Local storage keys
const STUDENTS_KEY = 'littlePalms_students';
const CLASSES_KEY = 'littlePalms_classes';
const FEES_KEY = 'littlePalms_fees';

// Helper to generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ===== STUDENT FUNCTIONS =====

// Get all students from storage
export function getAllStudents(): Student[] {
  const storedData = localStorage.getItem(STUDENTS_KEY);
  if (!storedData) return [];
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing student data:', error);
    return [];
  }
}

// Save all students
export function saveAllStudents(students: Student[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

// Add a new student
export function addStudent(student: Omit<Student, 'id'>): Student {
  const newStudent = { ...student, id: generateId() };
  const students = getAllStudents();
  students.push(newStudent);
  saveAllStudents(students);
  
  // Initialize fee entry for the new student
  initializeFeeEntry(newStudent.id);
  
  return newStudent;
}

// Get a student by ID
export function getStudentById(id: string): Student | undefined {
  const students = getAllStudents();
  return students.find(student => student.id === id);
}

// Update a student
export function updateStudent(id: string, updatedData: Partial<Student>): Student | null {
  const students = getAllStudents();
  const index = students.findIndex(student => student.id === id);
  
  if (index === -1) return null;
  
  const updatedStudent = { ...students[index], ...updatedData };
  students[index] = updatedStudent;
  saveAllStudents(students);
  
  return updatedStudent;
}

// Delete a student
export function deleteStudent(id: string): boolean {
  const students = getAllStudents();
  const filteredStudents = students.filter(student => student.id !== id);
  
  if (filteredStudents.length === students.length) {
    return false; // No student was deleted
  }
  
  saveAllStudents(filteredStudents);
  
  // Delete fee entry for the student
  deleteFeeEntry(id);
  
  return true;
}

// Search students
export function searchStudents(query: string): Student[] {
  if (!query.trim()) return getAllStudents();
  
  const students = getAllStudents();
  const lowercaseQuery = query.toLowerCase();
  
  return students.filter(student => 
    student.id.toLowerCase().includes(lowercaseQuery) ||
    student.name.toLowerCase().includes(lowercaseQuery) ||
    student.contactNumber.includes(query) ||
    (student.fatherName && student.fatherName.toLowerCase().includes(lowercaseQuery)) ||
    (student.motherName && student.motherName.toLowerCase().includes(lowercaseQuery)) ||
    (student.class && student.class.toLowerCase().includes(lowercaseQuery))
  );
}

// ===== FEES FUNCTIONS =====

// Get all fees entries
export function getAllFeeEntries(): FeeEntry[] {
  const storedData = localStorage.getItem(FEES_KEY);
  if (!storedData) return [];
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing fee data:', error);
    return [];
  }
}

// Save all fee entries
export function saveAllFeeEntries(fees: FeeEntry[]): void {
  localStorage.setItem(FEES_KEY, JSON.stringify(fees));
}

// Get fee entry by student ID
export function getFeeEntryByStudentId(studentId: string): FeeEntry | undefined {
  const fees = getAllFeeEntries();
  return fees.find(fee => fee.studentId === studentId);
}

// Initialize fee entry for a new student
export function initializeFeeEntry(studentId: string): FeeEntry {
  const fees = getAllFeeEntries();
  const existingFee = fees.find(fee => fee.studentId === studentId);
  
  if (existingFee) return existingFee;
  
  const newFeeEntry: FeeEntry = {
    id: generateId(),
    studentId,
    registrationFee: 0,
    admissionFee: 0,
    annualCharges: 0,
    monthlyFees: [],
    deposits: []
  };
  
  fees.push(newFeeEntry);
  saveAllFeeEntries(fees);
  
  return newFeeEntry;
}

// Update fee entry
export function updateFeeEntry(studentId: string, updatedData: Partial<FeeEntry>): FeeEntry | null {
  const fees = getAllFeeEntries();
  const index = fees.findIndex(fee => fee.studentId === studentId);
  
  if (index === -1) {
    // If not found, initialize and then update
    const newEntry = initializeFeeEntry(studentId);
    return updateFeeEntry(studentId, updatedData);
  }
  
  const updatedFeeEntry = { ...fees[index], ...updatedData };
  fees[index] = updatedFeeEntry;
  saveAllFeeEntries(fees);
  
  return updatedFeeEntry;
}

// Delete fee entry
export function deleteFeeEntry(studentId: string): boolean {
  const fees = getAllFeeEntries();
  const filteredFees = fees.filter(fee => fee.studentId !== studentId);
  
  if (filteredFees.length === fees.length) {
    return false; // No fee entry was deleted
  }
  
  saveAllFeeEntries(filteredFees);
  return true;
}

// Add monthly fee
export function addMonthlyFee(studentId: string, month: string, amount: number): MonthlyFee | null {
  const feeEntry = getFeeEntryByStudentId(studentId);
  
  if (!feeEntry) return null;
  
  // Check if the month already exists
  const existingMonthIndex = feeEntry.monthlyFees.findIndex(fee => fee.month === month);
  
  if (existingMonthIndex !== -1) {
    // Update existing month
    feeEntry.monthlyFees[existingMonthIndex].amount = amount;
  } else {
    // Add new month
    const newMonthlyFee: MonthlyFee = {
      id: generateId(),
      month,
      amount,
      paid: false
    };
    feeEntry.monthlyFees.push(newMonthlyFee);
  }
  
  updateFeeEntry(studentId, feeEntry);
  return existingMonthIndex !== -1 ? feeEntry.monthlyFees[existingMonthIndex] : feeEntry.monthlyFees[feeEntry.monthlyFees.length - 1];
}

// Add deposit
export function addDeposit(studentId: string, amount: number, date: string, remarks?: string): Deposit | null {
  const feeEntry = getFeeEntryByStudentId(studentId);
  
  if (!feeEntry) return null;
  
  const newDeposit: Deposit = {
    id: generateId(),
    amount,
    date,
    remarks
  };
  
  feeEntry.deposits.push(newDeposit);
  updateFeeEntry(studentId, feeEntry);
  
  return newDeposit;
}

// Calculate total fees
export function calculateTotalFees(studentId: string): number {
  const feeEntry = getFeeEntryByStudentId(studentId);
  
  if (!feeEntry) return 0;
  
  const oneTimeFees = feeEntry.registrationFee + feeEntry.admissionFee + feeEntry.annualCharges;
  const monthlyFeesTotal = feeEntry.monthlyFees.reduce((sum, fee) => sum + fee.amount, 0);
  
  return oneTimeFees + monthlyFeesTotal;
}

// Calculate total deposits
export function calculateTotalDeposits(studentId: string): number {
  const feeEntry = getFeeEntryByStudentId(studentId);
  
  if (!feeEntry) return 0;
  
  return feeEntry.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
}

// Calculate dues
export function calculateDues(studentId: string): number {
  const totalFees = calculateTotalFees(studentId);
  const totalDeposits = calculateTotalDeposits(studentId);
  
  return totalFees - totalDeposits;
}

// ===== CLASS FUNCTIONS =====

// Get all classes from storage
export function getAllClasses(): Class[] {
  const storedData = localStorage.getItem(CLASSES_KEY);
  if (!storedData) return [];
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing class data:', error);
    return [];
  }
}

// Save all classes
export function saveAllClasses(classes: Class[]): void {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

// Add a new class
export function addClass(classData: Omit<Class, 'id'>): Class {
  const newClass = { ...classData, id: generateId() };
  const classes = getAllClasses();
  classes.push(newClass);
  saveAllClasses(classes);
  return newClass;
}

// Get a class by ID
export function getClassById(id: string): Class | undefined {
  const classes = getAllClasses();
  return classes.find(cls => cls.id === id);
}

// Update a class
export function updateClass(id: string, updatedData: Partial<Class>): Class | null {
  const classes = getAllClasses();
  const index = classes.findIndex(cls => cls.id === id);
  
  if (index === -1) return null;
  
  const updatedClass = { ...classes[index], ...updatedData };
  classes[index] = updatedClass;
  saveAllClasses(classes);
  
  return updatedClass;
}

// Delete a class
export function deleteClass(id: string): boolean {
  const classes = getAllClasses();
  const filteredClasses = classes.filter(cls => cls.id !== id);
  
  if (filteredClasses.length === classes.length) {
    return false; // No class was deleted
  }
  
  saveAllClasses(filteredClasses);
  return true;
}

// Get students by class
export function getStudentsByClass(className: string): Student[] {
  const students = getAllStudents();
  return students.filter(student => student.class === className);
}

// Count students by class
export function countStudentsByClass(className: string): number {
  return getStudentsByClass(className).length;
}

// Get initial sample classes
export function getSampleClasses(): Class[] {
  return [
    {
      id: "c001",
      name: "Sunflower",
      capacity: 20,
      teacher: "Ms. Johnson",
      description: "Ages 3-4, focus on early development"
    },
    {
      id: "c002",
      name: "Daisy",
      capacity: 15,
      teacher: "Mr. Roberts",
      description: "Ages 4-5, pre-kindergarten preparation"
    },
    {
      id: "c003",
      name: "Tulip",
      capacity: 18,
      teacher: "Ms. Garcia",
      description: "Ages 3-4, bilingual program"
    }
  ];
}

// Get sample data for development/testing
export function getSampleData(): Student[] {
  return [
    {
      id: "lp001",
      name: "Ethan Parker",
      contactNumber: "555-123-4567",
      dateOfBirth: "2019-03-15",
      address: "123 Pine Avenue",
      fatherName: "James Parker",
      motherName: "Sarah Parker",
      emergencyContact: "555-987-6543",
      enrollmentDate: "2022-08-25",
      class: "Sunflower",
      notes: "Allergic to peanuts"
    },
    {
      id: "lp002",
      name: "Sophia Rodriguez",
      contactNumber: "555-234-5678",
      dateOfBirth: "2018-11-22",
      address: "456 Elm Street",
      fatherName: "Miguel Rodriguez",
      motherName: "Isabella Rodriguez",
      emergencyContact: "555-876-5432",
      enrollmentDate: "2021-09-10",
      class: "Daisy",
      notes: "Loves art activities"
    },
    {
      id: "lp003",
      name: "Noah Johnson",
      contactNumber: "555-345-6789",
      dateOfBirth: "2019-07-03",
      address: "789 Oak Road",
      fatherName: "Michael Johnson",
      motherName: "Lisa Johnson",
      emergencyContact: "555-765-4321",
      enrollmentDate: "2022-01-15",
      class: "Sunflower",
      notes: "Has an older sibling in elementary school"
    },
    {
      id: "lp004",
      name: "Olivia Williams",
      contactNumber: "555-456-7890",
      dateOfBirth: "2019-01-29",
      address: "101 Maple Drive",
      fatherName: "David Williams",
      motherName: "Emma Williams",
      emergencyContact: "555-654-3210",
      enrollmentDate: "2022-09-01",
      class: "Tulip",
      notes: "Needs assistance with speech development"
    },
    {
      id: "lp005",
      name: "Liam Brown",
      contactNumber: "555-567-8901",
      dateOfBirth: "2018-09-12",
      address: "202 Cedar Lane",
      fatherName: "Robert Brown",
      motherName: "Jennifer Brown",
      emergencyContact: "555-543-2109",
      enrollmentDate: "2021-08-20",
      class: "Daisy",
      notes: "Excels in physical activities"
    }
  ];
}

// Sample fee data for testing
export function getSampleFeeData(): FeeEntry[] {
  return [
    {
      id: "fee001",
      studentId: "lp001",
      registrationFee: 500,
      admissionFee: 1000,
      annualCharges: 2000,
      monthlyFees: [
        { id: "mf001", month: "2023-09", amount: 1500, paid: true },
        { id: "mf002", month: "2023-10", amount: 1500, paid: true },
        { id: "mf003", month: "2023-11", amount: 1500, paid: false }
      ],
      deposits: [
        { id: "dep001", amount: 3000, date: "2023-08-25", remarks: "Initial payment" },
        { id: "dep002", amount: 1500, date: "2023-09-05", remarks: "September fees" }
      ]
    },
    {
      id: "fee002",
      studentId: "lp002",
      registrationFee: 500,
      admissionFee: 1000,
      annualCharges: 2000,
      monthlyFees: [
        { id: "mf004", month: "2023-09", amount: 1500, paid: true },
        { id: "mf005", month: "2023-10", amount: 1500, paid: true }
      ],
      deposits: [
        { id: "dep003", amount: 3500, date: "2023-08-20", remarks: "Registration and first month" },
        { id: "dep004", amount: 1500, date: "2023-10-03", remarks: "October fees" }
      ]
    }
  ];
}

// Initialize with sample data if empty (for development)
export function initializeWithSampleData(): void {
  const students = getAllStudents();
  if (students.length === 0) {
    saveAllStudents(getSampleData());
  }
  
  const classes = getAllClasses();
  if (classes.length === 0) {
    saveAllClasses(getSampleClasses());
  }
  
  const fees = getAllFeeEntries();
  if (fees.length === 0) {
    saveAllFeeEntries(getSampleFeeData());
  }
}
