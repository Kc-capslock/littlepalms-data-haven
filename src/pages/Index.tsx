
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Users, List, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import StudentTable from '@/components/StudentTable';
import StudentCard from '@/components/StudentCard';
import StudentForm from '@/components/StudentForm';
import ClassManagement from '@/components/ClassManagement';
import {
  Student,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  initializeWithSampleData,
  getAllClasses
} from '@/utils/studentData';

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');

  useEffect(() => {
    initializeWithSampleData();
    refreshStudentData();
  }, []);

  const refreshStudentData = () => {
    const loadedStudents = getAllStudents();
    setStudents(loadedStudents);
    if (searchQuery.trim()) {
      setFilteredStudents(searchStudents(searchQuery));
    } else {
      setFilteredStudents(loadedStudents);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
    } else {
      const results = searchStudents(query);
      setFilteredStudents(results);
    }
  };

  const handleAddStudent = (studentData: Student) => {
    try {
      if (editingStudent) {
        // Update existing student
        const updated = updateStudent(editingStudent.id, studentData);
        if (updated) {
          toast.success("Student updated successfully");
          refreshStudentData();
        } else {
          toast.error("Failed to update student");
        }
      } else {
        // Add new student
        const newStudent = addStudent(studentData);
        if (newStudent) {
          toast.success("Student added successfully");
          refreshStudentData();
        } else {
          toast.error("Failed to add student");
        }
      }
      
      setIsFormOpen(false);
      setEditingStudent(undefined);
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("An error occurred while saving the student data");
    }
  };

  const handleDeleteStudent = (id: string) => {
    try {
      if (deleteStudent(id)) {
        toast.success("Student deleted successfully");
        refreshStudentData();
      } else {
        toast.error("Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("An error occurred while deleting the student");
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  // Get class stats for the dashboard
  const getClassCounts = () => {
    const classes = getAllClasses();
    return classes.slice(0, 3).map(cls => ({
      name: cls.name,
      count: students.filter(s => s.class === cls.name).length
    }));
  };

  const classStats = getClassCounts();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onSearch={handleSearch} />
      
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight animate-slideDown">
              Little Palms Kindergarten
            </h1>
            <p className="text-muted-foreground mt-1 animate-slideDown">
              Manage students and classes 
            </p>
          </div>
          
          {activeTab === 'students' && (
            <Button 
              onClick={() => {
                setEditingStudent(undefined);
                setIsFormOpen(true);
              }}
              className="animate-fadeIn"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          )}
        </div>
        
        <Card className="mb-8 overflow-hidden animate-fadeIn">
          <CardContent className="p-6">
            <div className="grid gap-1">
              <h2 className="text-xl font-semibold">Statistics</h2>
              <p className="text-muted-foreground text-sm">Student enrollment overview</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-primary/10 rounded-lg p-4 flex items-center">
                  <div className="bg-primary/20 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{students.length}</h3>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
                
                {classStats.map((stat, index) => (
                  <div 
                    key={stat.name} 
                    className={`${
                      index === 0 
                        ? "bg-secondary/20" 
                        : index === 1 
                          ? "bg-accent/20" 
                          : "bg-muted/20"
                    } rounded-lg p-4 flex items-center`}
                  >
                    <div className={`${
                      index === 0 
                        ? "bg-secondary/30" 
                        : index === 1 
                          ? "bg-accent/30" 
                          : "bg-muted/30"
                    } p-3 rounded-full mr-4`}>
                      <Users className={`h-6 w-6 ${
                        index === 0 
                          ? "text-secondary-foreground" 
                          : index === 1 
                            ? "text-accent-foreground" 
                            : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{stat.count}</h3>
                      <p className="text-sm text-muted-foreground">{stat.name} Class</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs 
          defaultValue="students" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'students' | 'classes')}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {searchQuery ? `Search Results (${filteredStudents.length})` : 'All Students'}
              </h2>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
            
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredStudents.map(student => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                  />
                ))}
                {filteredStudents.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {searchQuery ? 'No students found matching your search' : 'No students added yet'}
                  </div>
                )}
              </div>
            ) : (
              <StudentTable
                students={filteredStudents}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
              />
            )}
          </TabsContent>
          
          <TabsContent value="classes" className="mt-6">
            <ClassManagement refreshData={refreshStudentData} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingStudent(undefined);
        }
        setIsFormOpen(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <StudentForm
            student={editingStudent}
            onSubmit={handleAddStudent}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingStudent(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
