
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Users, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import ClassForm from './ClassForm';
import { Class, getAllClasses, addClass, updateClass, deleteClass, countStudentsByClass } from '@/utils/studentData';

interface ClassManagementProps {
  refreshData: () => void;
}

const ClassManagement = ({ refreshData }: ClassManagementProps) => {
  const [classes, setClasses] = useState<Class[]>(getAllClasses());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>(undefined);

  const refreshClasses = () => {
    setClasses(getAllClasses());
    refreshData();
  };

  const handleAddClass = (classData: Class) => {
    try {
      if (editingClass) {
        // Update existing class
        const updated = updateClass(editingClass.id, classData);
        if (updated) {
          toast.success("Class updated successfully");
          refreshClasses();
        } else {
          toast.error("Failed to update class");
        }
      } else {
        // Add new class
        const newClass = addClass(classData);
        if (newClass) {
          toast.success("Class added successfully");
          refreshClasses();
        } else {
          toast.error("Failed to add class");
        }
      }
      
      setIsFormOpen(false);
      setEditingClass(undefined);
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("An error occurred while saving the class data");
    }
  };

  const handleDeleteClass = (id: string) => {
    try {
      const studentCount = countStudentsByClass(classes.find(c => c.id === id)?.name || "");
      
      if (studentCount > 0) {
        toast.error(`Cannot delete class with ${studentCount} students assigned to it`);
        return;
      }
      
      if (confirm("Are you sure you want to delete this class?")) {
        if (deleteClass(id)) {
          toast.success("Class deleted successfully");
          refreshClasses();
        } else {
          toast.error("Failed to delete class");
        }
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("An error occurred while deleting the class");
    }
  };

  const handleEditClass = (classInfo: Class) => {
    setEditingClass(classInfo);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Classes</h2>
        <Button 
          onClick={() => {
            setEditingClass(undefined);
            setIsFormOpen(true);
          }}
          className="animate-fadeIn"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {classes.map(classInfo => {
          const studentCount = countStudentsByClass(classInfo.name);
          return (
            <Card key={classInfo.id} className="hover-scale glass-card animate-fadeIn">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{classInfo.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClass(classInfo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteClass(classInfo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {studentCount} / {classInfo.capacity} students
                    </span>
                  </div>
                  {classInfo.teacher && (
                    <p className="text-sm text-muted-foreground">
                      Teacher: {classInfo.teacher}
                    </p>
                  )}
                  {classInfo.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {classInfo.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {classes.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No classes added yet
          </div>
        )}
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingClass(undefined);
        }
        setIsFormOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          </DialogHeader>
          <ClassForm
            classInfo={editingClass}
            onSubmit={handleAddClass}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingClass(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManagement;
