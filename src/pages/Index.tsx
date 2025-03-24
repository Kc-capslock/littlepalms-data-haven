import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Users, List, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import StudentTable from '@/components/StudentTable';
import StudentCard from '@/components/StudentCard';
import StudentForm from '@/components/StudentForm';
import {
  Student,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  initializeWithSampleData
} from '@/utils/studentData';

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    initializeWithSampleData();
    const loadedStudents = getAllStudents();
    setStudents(loadedStudents);
    setFilteredStudents(loadedStudents);
  }, []);

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
    const newStudent = { ...studentData };
    
    if (editingStudent) {
      const updated = updateStudent(editingStudent.id, newStudent);
      if (updated) {
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        setFilteredStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.success("Student updated successfully");
      }
    } else {
      addStudent(newStudent);
      setStudents(getAllStudents());
      setFilteredStudents(getAllStudents());
      toast.success("Student added successfully");
    }
    
    setIsFormOpen(false);
    setEditingStudent(undefined);
  };

  const handleDeleteStudent = (id: string) => {
    if (deleteStudent(id)) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setFilteredStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onSearch={handleSearch} />
      
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight animate-slideDown">
              Student Records
            </h1>
            <p className="text-muted-foreground mt-1 animate-slideDown">
              Manage students at Little Palms Kindergarten
            </p>
          </div>
          
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
                
                <div className="bg-secondary/20 rounded-lg p-4 flex items-center">
                  <div className="bg-secondary/30 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {students.filter(s => s.class === 'Sunflower').length}
                    </h3>
                    <p className="text-sm text-muted-foreground">Sunflower Class</p>
                  </div>
                </div>
                
                <div className="bg-accent/20 rounded-lg p-4 flex items-center">
                  <div className="bg-accent/30 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {students.filter(s => s.class === 'Daisy').length}
                    </h3>
                    <p className="text-sm text-muted-foreground">Daisy Class</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
      </main>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
