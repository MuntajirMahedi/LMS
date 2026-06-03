import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  Upload,
  UserSquare2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getUsers } from '../mock/users';

interface Section {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  hodId?: string;
  sections: Section[];
}



export default function CreateSchoolPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<string[]>(Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`));
  const [departments, setDepartments] = useState<string[]>(['General', 'Science', 'Commerce', 'Arts']);
  const [newClass, setNewClass] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const departmentOptions = departments.map(d => ({ label: d, value: d }));
  const hodOptions = getUsers().filter(u => u.roles.includes('HOD')).map(u => ({ label: u.name, value: u.id }));

  const handleAddClass = () => {
    if (newClass.trim() && !classes.includes(newClass.trim())) {
      setClasses([...classes, newClass.trim()]);
      setNewClass('');
    }
  };

  const handleRemoveClass = (c: string) => {
    setClasses(classes.filter(cls => cls !== c));
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (d: string) => {
    setDepartments(departments.filter(dep => dep !== d));
  };

  const [classStructures, setClassStructures] = useState<Record<string, Department[]>>({});

  const handleAddDepartmentToClass = (className: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: [...currentDepts, { id: `d${Date.now()}`, name: '', sections: [] }]
      };
    });
  };

  const handleRemoveDepartmentFromClass = (className: string, deptId: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: currentDepts.filter(d => d.id !== deptId)
      };
    });
  };

  const handleUpdateDepartmentName = (className: string, deptId: string, name: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: currentDepts.map(d => d.id === deptId ? { ...d, name } : d)
      };
    });
  };

  const handleUpdateDepartmentHOD = (className: string, deptId: string, hodId: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: currentDepts.map(d => d.id === deptId ? { ...d, hodId } : d)
      };
    });
  };

  const handleAddSection = (className: string, deptId: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: currentDepts.map(d => {
          if (d.id === deptId) {
            const nextSectionChar = String.fromCharCode(65 + d.sections.length);
            return {
              ...d,
              sections: [...d.sections, { id: `s${Date.now()}`, name: nextSectionChar }]
            };
          }
          return d;
        })
      };
    });
  };

  const handleRemoveSection = (className: string, deptId: string, sectionId: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: currentDepts.map(d => {
          if (d.id === deptId) {
            return { ...d, sections: d.sections.filter(s => s.id !== sectionId) };
          }
          return d;
        })
      };
    });
  };

  const handleUpdateSectionName = (className: string, deptId: string, sectionId: string, name: string) => {
    setClassStructures(prev => {
      const currentDepts = prev[className] || [];
      return {
        ...prev,
        [className]: currentDepts.map(d => {
          if (d.id === deptId) {
            return {
              ...d,
              sections: d.sections.map(s => s.id === sectionId ? { ...s, name } : s)
            };
          }
          return d;
        })
      };
    });
  };

  const handleSave = () => {
    // In a real app, you would make an API call here.
    // For now, we simulate success and pass a flag to show the school exists.
    localStorage.setItem('schoolClassStructures', JSON.stringify(classStructures));
    navigate('/school-structure', { state: { hasSchool: true } });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-64">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <button 
            onClick={() => navigate('/school-structure')}
            className="w-10 h-10 shrink-0 rounded-xl bg-white border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors mt-1 md:mt-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#3A2C2B]">Create School</h1>
            <p className="text-muted-foreground font-medium italic text-xs md:text-sm mt-1">Initialize your institution's profile and physical structure</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          className="w-full md:w-auto h-12 px-8 rounded-xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-wider"
        >
          <Save className="w-4 h-4 mr-2 shrink-0" /> Complete Setup
        </Button>
      </div>

      <div className="flex flex-col gap-12 relative">
        {/* Step 1: Top Section: Basic Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">1</div>
            <div>
              <h2 className="text-xl font-black text-[#3A2C2B]">School Profile</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Basic institution information</p>
            </div>
          </div>
          <Card className="border-2 border-primary/10 shadow-xl bg-white rounded-[24px] overflow-hidden">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">School Name</label>
                <Input placeholder="e.g. EduSync International" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Principal Name</label>
                <Input placeholder="e.g. Dr. Sarah Johnson" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration No.</label>
                <Input placeholder="REG-2026" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Established</label>
                <Input type="number" placeholder="YYYY" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Address</label>
                <Input placeholder="123 Education Blvd" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</label>
                <Input placeholder="+1 234 567" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                <Input placeholder="admin@school.com" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Address</label>
                <Input placeholder="123 Education Blvd" />
              </div>
              
              {/* Full Width Logo Upload */}
              <div className="lg:col-span-4 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">School Logo</label>
                <div className="relative border-2 border-dashed border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/svg+xml, image/webp" 
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-[20px] bg-white shadow-sm border border-border/50 p-3 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <img src={logoPreview} alt="School Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-xl">
                        <Upload className="w-3.5 h-3.5" /> Replace Image
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-[#3A2C2B]">Click or drag to upload logo</p>
                      <p className="text-xs font-medium text-muted-foreground mt-1.5">Supports SVG, PNG, JPG or WEBP (max. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Middle Section: Academic Structure */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">2</div>
            <div>
              <h2 className="text-xl font-black text-[#3A2C2B]">Academic Structure</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Define classes and departments</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/10 shadow-lg bg-white rounded-[24px] transition-all hover:border-primary/30">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-4 px-6 rounded-t-[24px]">
                <CardTitle className="text-lg font-black text-[#3A2C2B]">Classes</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-2">
                  <Input 
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="e.g. Nursery, LKG, Class 13"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                  />
                  <Button onClick={handleAddClass} variant="outline" className="shrink-0 bg-white">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {classes.map(c => (
                    <div key={c} className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/50 text-xs font-bold text-[#3A2C2B]">
                      {c}
                      <button onClick={() => handleRemoveClass(c)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {classes.length === 0 && <span className="text-xs text-muted-foreground italic">No classes defined.</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 shadow-lg bg-white rounded-[24px] transition-all hover:border-primary/30">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-4 px-6 rounded-t-[24px]">
                <CardTitle className="text-lg font-black text-[#3A2C2B]">Departments</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-2">
                  <Input 
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="e.g. Humanities, Vocational"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment()}
                  />
                  <Button onClick={handleAddDepartment} variant="outline" className="shrink-0 bg-white">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {departments.map(d => (
                    <div key={d} className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/50 text-xs font-bold text-[#3A2C2B]">
                      {d}
                      <button onClick={() => handleRemoveDepartment(d)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {departments.length === 0 && <span className="text-xs text-muted-foreground italic">No departments defined.</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Step 3: Bottom Section: Class Structure */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">3</div>
            <div>
              <h2 className="text-xl font-black text-[#3A2C2B]">Class Structure Builder</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Map out departments and sections per class</p>
            </div>
          </div>

          <div className="space-y-6">
            {classes.length === 0 ? (
               <div className="text-center py-8 bg-secondary/10 border-2 border-dashed border-primary/20 rounded-[24px]">
                 <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Classes Defined</p>
                 <p className="text-xs text-muted-foreground mt-2">Add classes in Step 2 to configure their structure here.</p>
               </div>
            ) : (
              classes.map((className) => {
                const classDepts = classStructures[className] || [];
                return (
                  <Card key={className} className="border-2 border-primary/10 shadow-lg bg-white rounded-[24px] transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-[24px]">
                      <div className="flex items-center gap-3 w-full sm:flex-1 sm:mr-4">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-black text-[#3A2C2B]">{className}</h3>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button onClick={() => handleAddDepartmentToClass(className)} variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white shrink-0 flex-1 sm:flex-none border-2 hover:border-primary/50">
                          <Plus className="w-3 h-3 mr-1" /> Add Department
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-6">
                      {classDepts.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Departments Added</p>
                          <Button onClick={() => handleAddDepartmentToClass(className)} variant="link" className="text-primary mt-1 text-xs">Add a department for this class</Button>
                        </div>
                      ) : (
                        classDepts.map((dept) => (
                          <div key={dept.id} className="bg-secondary/20 border border-border/50 rounded-2xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                              <div className="flex flex-col xl:flex-row gap-3 w-full flex-1">
                                <div className="flex items-center gap-3 w-full xl:w-auto">
                                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <Select 
                                    options={departmentOptions}
                                    value={dept.name}
                                    onChange={(val) => handleUpdateDepartmentName(className, dept.id, val)}
                                    className="h-9 text-sm font-bold bg-white border-none shadow-sm rounded-xl w-full xl:w-48"
                                    placeholder="Select Department"
                                  />
                                </div>
                                <div className="flex items-center gap-3 w-full xl:w-auto">
                                  <UserSquare2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <Select 
                                    options={hodOptions}
                                    value={dept.hodId || ''}
                                    onChange={(val) => handleUpdateDepartmentHOD(className, dept.id, val)}
                                    className="h-9 text-sm font-bold bg-white border-none shadow-sm rounded-xl w-full xl:w-48"
                                    placeholder="Assign HOD"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <Button onClick={() => handleAddSection(className, dept.id)} variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase bg-white shrink-0 flex-1 sm:flex-none border-2 hover:border-primary/50">
                                  <Plus className="w-3 h-3 mr-1" /> Section
                                </Button>
                                <Button onClick={() => handleRemoveDepartmentFromClass(className, dept.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {dept.sections.length > 0 && (
                              <div className="flex flex-wrap gap-3">
                                {dept.sections.map((section) => (
                                  <div key={section.id} className="bg-white border border-border/50 rounded-xl p-2.5 shadow-sm relative group flex items-center gap-2 w-[100px]">
                                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase">
                                      {section.name.charAt(0)}
                                    </div>
                                    <Input 
                                      value={section.name}
                                      onChange={(e) => handleUpdateSectionName(className, dept.id, section.id, e.target.value)}
                                      className="h-6 text-xs font-bold border-none shadow-none p-0 focus-visible:ring-0 w-full"
                                      placeholder="Sec"
                                    />
                                    <button 
                                      onClick={() => handleRemoveSection(className, dept.id, section.id)}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
