
export interface Student {
  id: string;
  name: string;
  contactNumber: string;
  dateOfBirth: string;
  address?: string;
  parentName?: string;
  emergencyContact?: string;
  enrollmentDate?: string;
  class?: string;
  notes?: string;
}

// Local storage key
const STORAGE_KEY = 'littlePalms_students';

// Helper to generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Get all students from storage
export function getAllStudents(): Student[] {
  const storedData = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Add a new student
export function addStudent(student: Omit<Student, 'id'>): Student {
  const newStudent = { ...student, id: generateId() };
  const students = getAllStudents();
  students.push(newStudent);
  saveAllStudents(students);
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
    (student.parentName && student.parentName.toLowerCase().includes(lowercaseQuery)) ||
    (student.class && student.class.toLowerCase().includes(lowercaseQuery))
  );
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
      parentName: "Sarah Parker",
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
      parentName: "Miguel Rodriguez",
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
      parentName: "Lisa Johnson",
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
      parentName: "David Williams",
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
      parentName: "Jennifer Brown",
      emergencyContact: "555-543-2109",
      enrollmentDate: "2021-08-20",
      class: "Daisy",
      notes: "Excels in physical activities"
    }
  ];
}

// Initialize with sample data if empty (for development)
export function initializeWithSampleData(): void {
  const students = getAllStudents();
  if (students.length === 0) {
    saveAllStudents(getSampleData());
  }
}
