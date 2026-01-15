
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, Member } from '../types';
import { dataService } from '../services/dataService';

const MemberManager: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(dataService.getMembers());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter states
  const [filterDept, setFilterDept] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    department: 'None',
    role: UserRole.MEMBER,
    photo_url: ''
  });

  useEffect(() => {
    return dataService.subscribe(() => {
      setMembers(dataService.getMembers());
    });
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 3) {
      errors.full_name = 'Name is too short';
    }

    const phoneRegex = /^\+?(\d[\s-]?){7,15}$/;
    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone_number)) {
      errors.phone_number = 'Enter a valid phone number (e.g. +231...)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormErrors({});
    setFormData({ 
      full_name: '', 
      phone_number: '', 
      email: '',
      department: 'None', 
      role: UserRole.MEMBER,
      photo_url: '' 
    });
    setShowModal(true);
  };

  const openEditModal = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMember(member);
    setFormErrors({});
    setFormData({
      full_name: member.full_name,
      phone_number: member.phone_number,
      email: member.email || '',
      department: member.department || 'None',
      role: member.role,
      photo_url: member.photo_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingMember) {
      dataService.updateMember(editingMember.id, formData);
    } else {
      dataService.addMember(formData);
    }
    setShowModal(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await dataService.uploadPhoto(file);
      setFormData(prev => ({ ...prev, photo_url: url }));
    } catch (err) {
      console.error("Photo upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFilters = () => {
    setFilterDept('All');
    setFilterRole('All');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const filtered = members.filter(m => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.phone_number.includes(searchTerm) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = filterDept === 'All' || m.department === filterDept;
    const matchesRole = filterRole === 'All' || m.role === filterRole;
    
    let matchesDate = true;
    const joinDate = new Date(m.join_date);
    if (dateFrom) {
      matchesDate = matchesDate && joinDate >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && joinDate <= new Date(dateTo);
    }

    return matchesSearch && matchesDept && matchesRole && matchesDate;
  });

  const getAvatarUrl = (member: Member) => {
    return member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=1e40af&color=fff`;
  };

  const departments = ['None', 'Choir', 'Ushers', 'Media', 'Welfare', 'Youth'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Church Directory</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 hover:bg-blue-900 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Register Member</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 flex items-center space-x-3 bg-gray-50 p-2 px-4 rounded-xl border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, phone, or email..." 
              className="flex-1 outline-none border-none focus:ring-0 p-1 bg-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-blue-800 border-blue-800 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Department</label>
              <select 
                className="w-full text-xs p-2 bg-white rounded-lg border-gray-200 focus:ring-blue-800 transition-all font-bold"
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Role</label>
              <select 
                className="w-full text-xs p-2 bg-white rounded-lg border-gray-200 focus:ring-blue-800 transition-all font-bold"
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value={UserRole.MEMBER}>Member</option>
                <option value={UserRole.DEPT_HEAD}>Dept Head</option>
                <option value={UserRole.FINANCE_OFFICER}>Finance</option>
                <option value={UserRole.PASTOR}>Pastor</option>
                <option value={UserRole.SUPER_ADMIN}>Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Joined After</label>
              <input 
                type="date"
                className="w-full text-xs p-2 bg-white rounded-lg border-gray-200 focus:ring-blue-800 transition-all font-bold"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Joined Before</label>
                <input 
                  type="date"
                  className="w-full text-xs p-2 bg-white rounded-lg border-gray-200 focus:ring-blue-800 transition-all font-bold"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
              <button 
                onClick={clearFilters}
                className="p-2.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                title="Clear Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(member => (
                <tr 
                  key={member.id} 
                  onClick={() => navigate(`/members/${member.id}`)}
                  className="hover:bg-gray-50 group transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-blue-50">
                        <img 
                          src={getAvatarUrl(member)} 
                          alt={member.full_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">{member.full_name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{member.phone_number}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-tighter">
                      {member.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-bold">
                    {new Date(member.join_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={(e) => openEditModal(member, e)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); dataService.deleteMember(member.id); }}
                      className="text-red-500 hover:text-red-700 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-2">🔍</div>
                      <p className="font-medium">No members found matching your criteria.</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-2 text-blue-800 font-bold text-xs underline"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in zoom-in slide-in-from-bottom-4 duration-300 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900">{editingMember ? 'Update Profile' : 'New Member'}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                    </svg>
                  </button>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="flex flex-col items-center space-y-3 mb-6">
                      <div className="relative group">
                        <div className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-inner overflow-hidden bg-gray-100 flex items-center justify-center">
                          {formData.photo_url ? (
                            <img src={formData.photo_url} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <div className="text-gray-300 text-4xl">👤</div>
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-blue-800 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef} 
                        accept="image/*" 
                        capture="user" 
                        onChange={handlePhotoUpload} 
                      />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tap to update photo</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Full Name</label>
                          <input 
                            type="text" 
                            className={`w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 transition-all font-medium ${formErrors.full_name ? 'ring-2 ring-red-500' : ''}`} 
                            required 
                            placeholder="e.g. Samuel J. Kollie"
                            value={formData.full_name}
                            onChange={e => {
                              setFormData({...formData, full_name: e.target.value});
                              if (formErrors.full_name) setFormErrors({...formErrors, full_name: ''});
                            }}
                          />
                          {formErrors.full_name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formErrors.full_name}</p>}
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Phone Number</label>
                          <input 
                            type="tel" 
                            className={`w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 transition-all font-medium ${formErrors.phone_number ? 'ring-2 ring-red-500' : ''}`} 
                            required 
                            placeholder="e.g. +231 770 123 456"
                            value={formData.phone_number}
                            onChange={e => {
                              setFormData({...formData, phone_number: e.target.value});
                              if (formErrors.phone_number) setFormErrors({...formErrors, phone_number: ''});
                            }}
                          />
                          {formErrors.phone_number && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formErrors.phone_number}</p>}
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Email (Optional)</label>
                          <input 
                            type="email" 
                            className={`w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 transition-all font-medium ${formErrors.email ? 'ring-2 ring-red-500' : ''}`} 
                            placeholder="e.g. member@example.com"
                            value={formData.email}
                            onChange={e => {
                              setFormData({...formData, email: e.target.value});
                              if (formErrors.email) setFormErrors({...formErrors, email: ''});
                            }}
                          />
                          {formErrors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formErrors.email}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Dept.</label>
                              <select 
                                className="w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 transition-all font-medium"
                                value={formData.department}
                                onChange={e => setFormData({...formData, department: e.target.value})}
                              >
                                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Role</label>
                              <select 
                                className="w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 transition-all font-medium"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                              >
                                  <option value={UserRole.MEMBER}>Member</option>
                                  <option value={UserRole.DEPT_HEAD}>Dept Head</option>
                                  <option value={UserRole.FINANCE_OFFICER}>Finance</option>
                                  <option value={UserRole.PASTOR}>Pastor</option>
                              </select>
                          </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 bg-blue-800 py-4 rounded-2xl font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-900 active:scale-95 transition-all">
                          {editingMember ? 'Update Profile' : 'Complete Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default MemberManager;
