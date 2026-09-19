import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  Phone,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBakery } from '../../context/BakeryContext';
import { StaffMember, StaffRole, StaffPermissions } from '../../types';
import { soundFx } from '../../utils/audio';

interface StaffManagementProps {
  isEmbedded?: boolean;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ isEmbedded = false }) => {
  const {
    staffMembers,
    currentStaff,
    setCurrentStaff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
  } = useBakery();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [role, setRole] = useState<StaffRole>('CASHIER');
  const [pinCode, setPinCode] = useState('1234');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('👨‍💼');
  const [permissions, setPermissions] = useState<StaffPermissions>({
    canAccessPos: true,
    canAccessShowcase: true,
    canAccessCustomOrders: true,
    canAccessSalesHistory: true,
    canEditSales: false,
    canAccessExpenses: false,
    canAccessInventory: false,
    canAccessReports: false,
    canAccessSettings: false,
  });

  // Handle Role Template presets
  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    switch (newRole) {
      case 'ADMIN':
        setAvatar('👩‍🍳');
        setPermissions({
          canAccessPos: true,
          canAccessShowcase: true,
          canAccessCustomOrders: true,
          canAccessSalesHistory: true,
          canEditSales: true,
          canAccessExpenses: true,
          canAccessInventory: true,
          canAccessReports: true,
          canAccessSettings: true,
        });
        break;
      case 'CASHIER':
        setAvatar('👨‍💼');
        setPermissions({
          canAccessPos: true,
          canAccessShowcase: true,
          canAccessCustomOrders: true,
          canAccessSalesHistory: true,
          canEditSales: false,
          canAccessExpenses: false,
          canAccessInventory: false,
          canAccessReports: false,
          canAccessSettings: false,
        });
        break;
      case 'BAKER':
        setAvatar('👨‍🍳');
        setPermissions({
          canAccessPos: false,
          canAccessShowcase: true,
          canAccessCustomOrders: true,
          canAccessSalesHistory: false,
          canEditSales: false,
          canAccessExpenses: false,
          canAccessInventory: true,
          canAccessReports: false,
          canAccessSettings: false,
        });
        break;
      case 'INVENTORY':
        setAvatar('👩‍💼');
        setPermissions({
          canAccessPos: false,
          canAccessShowcase: true,
          canAccessCustomOrders: false,
          canAccessSalesHistory: false,
          canEditSales: false,
          canAccessExpenses: true,
          canAccessInventory: true,
          canAccessReports: false,
          canAccessSettings: false,
        });
        break;
    }
  };

  const handleOpenAdd = () => {
    soundFx.playPop();
    setEditingStaff(null);
    setName('');
    setNameEn('');
    setPinCode(`${Math.floor(1000 + Math.random() * 9000)}`);
    setPhone('');
    handleRoleChange('CASHIER');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    soundFx.playPop();
    setEditingStaff(staff);
    setName(staff.name);
    setNameEn(staff.nameEn);
    setRole(staff.role);
    setPinCode(staff.pinCode);
    setPhone(staff.phone || '');
    setAvatar(staff.avatar || '👤');
    setPermissions(staff.permissions);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || pinCode.length !== 4) return;

    soundFx.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        name,
        nameEn: nameEn || name,
        role,
        pinCode,
        phone,
        avatar,
        permissions,
      });
    } else {
      addStaffMember({
        name,
        nameEn: nameEn || name,
        role,
        pinCode,
        phone,
        avatar,
        isActive: true,
        permissions,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, staffName: string) => {
    if (staffMembers.length <= 1) {
      alert('មិនអាចលុបបុគ្គលិកចុងក្រោយគេបានទេ!');
      return;
    }
    if (window.confirm(`តើអ្នកពិតជាចង់លុបបុគ្គលិក «${staffName}» មែនទេ?`)) {
      soundFx.playPop();
      deleteStaffMember(id);
    }
  };

  const togglePermission = (key: keyof StaffPermissions) => {
    soundFx.playPop();
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const roleMeta = (r: StaffRole) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'ម្ចាស់ហាង (Admin)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'CASHIER':
        return { label: 'បេឡាធិការ (Cashier)', color: 'bg-pink-100 text-pink-900 border-pink-300' };
      case 'BAKER':
        return { label: 'មេចុងភៅដុតនំ (Baker)', color: 'bg-orange-100 text-orange-900 border-orange-300' };
      case 'INVENTORY':
        return { label: 'គ្រប់គ្រងស្តុក (Inventory)', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
  };

  const permissionLabels: { key: keyof StaffPermissions; title: string; desc: string }[] = [
    { key: 'canAccessPos', title: 'លក់នៅបញ្ជរ POS', desc: 'អាចបង្កើតការលក់ ជ្រើសរើសនំ និងគិតលុយ' },
    { key: 'canAccessShowcase', title: 'កាតាឡុកបង្ហាញភ្ញៀវ', desc: 'អាចបើកកាតាឡុក និងបញ្ចាំងស្លាយនំស្អាតៗ' },
    { key: 'canAccessCustomOrders', title: 'គ្រប់គ្រងនំកុម្ម៉ង់', desc: 'កត់ត្រានំខួបកំណើត តាមដានការដុត និងតែងនំ' },
    { key: 'canAccessSalesHistory', title: 'ប្រវត្តិការលក់ & វិក្កយបត្រ', desc: 'មើលបញ្ជីវិក្កយបត្រ និងបោះពុម្ពឡើងវិញ' },
    { key: 'canEditSales', title: 'កែប្រែ / លុបទិន្នន័យលក់', desc: 'សិទ្ធិកែប្រែវិក្កយបត្រចាស់ៗ (Admin / Manager)' },
    { key: 'canAccessExpenses', title: 'គ្រប់គ្រងការចំណាយ', desc: 'កត់ត្រាការទិញឥវ៉ាន់ ថ្លៃទឹកភ្លើង និងចំណាយហាង' },
    { key: 'canAccessInventory', title: 'ស្តុក & រូបមន្តដុតនំ', desc: 'គ្រប់គ្រងគ្រឿងផ្សំ ម្សៅ ប័រ និងថ្លៃដើម BOM' },
    { key: 'canAccessReports', title: 'របាយការណ៍ហិរញ្ញវត្ថុ & ចំណេញ', desc: 'មើលចំណូល ចំណាយ ប្រាក់ចំណេញសុទ្ធ' },
    { key: 'canAccessSettings', title: 'កំណត់ប្រព័ន្ធ & ហាង', desc: 'ប្តូរ Logo ហាង, KHQR, អត្រាប្តូរប្រាក់ និងគ្រប់គ្រងបុគ្គលិក' },
  ];

  return (
    <div className={isEmbedded ? "space-y-4" : "flex-1 flex flex-col p-6 overflow-y-auto space-y-6"}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`${isEmbedded ? 'text-base' : 'text-xl'} font-black text-slate-800 tracking-tight flex items-center gap-2`}>
            <span>👥</span>
            <span>គ្រប់គ្រងបុគ្គលិក & កំណត់សិទ្ធិ (Staff & Permissions)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            កំណត់តួនាទី សិទ្ធិប្រើប្រាស់មុខងារនីមួយៗ និងលេខកូដសម្ងាត់ PIN របស់បុគ្គលិក
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ បន្ថែមបុគ្គលិកថ្មី</span>
        </button>
      </div>

      {/* Current Active Staff Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-2xl shadow-sm">
            {currentStaff.avatar || '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-800 font-bold">គណនីកំពុងចូលប្រើប្រព័ន្ធ៖</span>
              <strong className="text-slate-900 font-black text-sm">{currentStaff.name}</strong>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  roleMeta(currentStaff.role).color
                }`}
              >
                {roleMeta(currentStaff.role).label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              សិទ្ធិប្រើប្រាស់បច្ចុប្បន្នត្រូវបានកំណត់ដោយស្វ័យប្រវត្តិទៅតាមតួនាទីនេះ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Key className="w-3.5 h-3.5 text-amber-600" />
          <span>PIN: {currentStaff.pinCode}</span>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffMembers.map((staff) => {
          const isCurrent = staff.id === currentStaff.id;
          const { label, color } = roleMeta(staff.role);

          return (
            <div
              key={staff.id}
              className={`bg-white rounded-3xl p-5 border-2 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isCurrent ? 'border-pink-500 ring-2 ring-pink-400/20' : 'border-rose-100 hover:border-pink-300'
              }`}
            >
              {/* Top info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                    {staff.avatar || '👤'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-slate-800 text-sm">{staff.name}</h3>
                      {isCurrent && (
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                          កំពុងប្រើ
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border inline-block mt-0.5 ${color}`}>
                      {label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(staff)}
                    title="កែសម្រួលព័ត៌មាន & សិទ្ធិ"
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-500 hover:text-pink-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {staffMembers.length > 1 && (
                    <button
                      onClick={() => handleDelete(staff.id, staff.name)}
                      title="លុបបុគ្គលិក"
                      className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* PIN & Phone details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">លេខកូដ PIN:</span>
                  <span className="font-mono font-bold text-slate-800">● ● ● ● ({staff.pinCode})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">លេខទូរស័ព្ទ:</span>
                  <span className="font-semibold text-slate-700">{staff.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Permissions Checklist summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  សិទ្ធិប្រើប្រាស់លើប្រព័ន្ធ៖
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="flex items-center gap-1">
                    {staff.permissions.canAccessPos ? (
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-3 h-3 text-slate-300" />
                    )}
                    <span className={staff.permissions.canAccessPos ? 'font-bold text-slate-700' : 'text-slate-400'}>
                      លក់ POS
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {staff.permissions.canAccessCustomOrders ? (
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-3 h-3 text-slate-300" />
                    )}
                    <span className={staff.permissions.canAccessCustomOrders ? 'font-bold text-slate-700' : 'text-slate-400'}>
                      នំកុម្ម៉ង់
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {staff.permissions.canAccessExpenses ? (
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-3 h-3 text-slate-300" />
                    )}
                    <span className={staff.permissions.canAccessExpenses ? 'font-bold text-slate-700' : 'text-slate-400'}>
                      ចំណាយ
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {staff.permissions.canAccessInventory ? (
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-3 h-3 text-slate-300" />
                    )}
                    <span className={staff.permissions.canAccessInventory ? 'font-bold text-slate-700' : 'text-slate-400'}>
                      ស្តុក & រូបមន្ត
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {staff.permissions.canAccessReports ? (
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-3 h-3 text-slate-300" />
                    )}
                    <span className={staff.permissions.canAccessReports ? 'font-bold text-slate-700' : 'text-slate-400'}>
                      របាយការណ៍
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {staff.permissions.canEditSales ? (
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                    ) : (
                      <X className="w-3 h-3 text-slate-300" />
                    )}
                    <span className={staff.permissions.canEditSales ? 'font-bold text-slate-700' : 'text-slate-400'}>
                      កែទិន្នន័យលក់
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Switch to this staff */}
              {!isCurrent ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSuccess();
                    setCurrentStaff(staff);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-pink-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ប្តូរមកគណនីនេះ (Switch)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-center py-2 bg-pink-50 text-pink-700 rounded-xl text-xs font-black">
                  ✓ កំពុងសកម្ម
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-pink-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                <h3 className="font-black text-slate-800 text-base">
                  {editingStaff ? 'កែសម្រួលបុគ្គលិក & សិទ្ធិ' : 'បន្ថែមបុគ្គលិកថ្មី (New Staff Member)'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Name & English Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះបុគ្គលិក (ភាសាខ្មែរ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ឧ. ដារ៉ា"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះជាអក្សរឡាតាំង (English)
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Dara"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  តួនាទី (Role) - ប្រព័ន្ធនឹងរៀបចំសិទ្ធិដោយស្វ័យប្រវត្តិ៖
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['ADMIN', 'CASHIER', 'BAKER', 'INVENTORY'] as StaffRole[]).map((r) => {
                    const isSelected = role === r;
                    const meta = roleMeta(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer ${
                          isSelected
                            ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-600/25'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN Code & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខកូដ PIN សម្ងាត់ (4 ខ្ទង់) *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="ឧ. 1234"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono font-bold text-center tracking-widest text-pink-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខទូរស័ព្ទ (Phone)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ឧ. 012 345 678"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Avatar Emoji */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  រូបតំណាង (Avatar Icon)
                </label>
                <div className="flex items-center gap-2">
                  {['👩‍🍳', '👨‍🍳', '👨‍💼', '👩‍💼', '🧑‍🍳', '🎂', '🧁'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl border text-xl flex items-center justify-center transition-all cursor-pointer ${
                        avatar === emoji
                          ? 'border-pink-500 bg-pink-50 scale-110 shadow-xs'
                          : 'border-slate-200 hover:border-pink-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  កំណត់សិទ្ធិលម្អិត (Granular Permissions):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {permissionLabels.map((perm) => {
                    const isChecked = !!permissions[perm.key];
                    return (
                      <div
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-pink-50/50 border-pink-200 text-slate-800'
                            : 'bg-slate-50/50 border-slate-200/80 text-slate-400'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{perm.title}</span>
                          <span className="text-[10px] text-slate-400">{perm.desc}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-pink-600 border-pink-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-black rounded-xl shadow-md shadow-pink-600/25 transition-all cursor-pointer"
                >
                  {editingStaff ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតបុគ្គលិកថ្មី'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
