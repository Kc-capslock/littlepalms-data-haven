
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Student } from '@/utils/studentData';
import { generateId } from '@/utils/studentData';
import { toast } from 'sonner';

interface StudentFormProps {
  student?: Student;
  onSubmit: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm = ({ student, onSubmit, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState<Student>({
    id: '',
    name: '',
    contactNumber: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    emergencyContact: '',
    enrollmentDate: '',
    class: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Student, string>>>({});

  useEffect(() => {
    if (student) {
      // Edit mode - populate form with student data
      setFormData(student);
    } else {
      // Create mode - set a new ID
      setFormData(prev => ({ ...prev, id: generateId() }));
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name as keyof Student]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Student, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }
    
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of Birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      toast.success(student ? "Student updated successfully" : "Student added successfully");
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slideUp">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">Student ID</Label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Enter student ID"
            readOnly
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter student name"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={errors.dateOfBirth ? "border-destructive" : ""}
          />
          {errors.dateOfBirth && <p className="text-destructive text-xs">{errors.dateOfBirth}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Enter contact number"
            className={errors.contactNumber ? "border-destructive" : ""}
          />
          {errors.contactNumber && <p className="text-destructive text-xs">{errors.contactNumber}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="parentName">Parent/Guardian Name</Label>
          <Input
            id="parentName"
            name="parentName"
            value={formData.parentName || ""}
            onChange={handleChange}
            placeholder="Enter parent name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact || ""}
            onChange={handleChange}
            placeholder="Enter emergency contact"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Input
            id="class"
            name="class"
            value={formData.class || ""}
            onChange={handleChange}
            placeholder="Enter class name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="enrollmentDate">Enrollment Date</Label>
          <Input
            id="enrollmentDate"
            name="enrollmentDate"
            type="date"
            value={formData.enrollmentDate || ""}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="Enter student address"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Enter additional notes"
          className="min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{student ? "Update Student" : "Add Student"}</Button>
      </div>
    </form>
  );
};

export default StudentForm;
