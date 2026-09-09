import { Check, Mail, MoreHorizontal, Plus, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { useCms } from '../context/CmsContext';
import { initials } from '../utils/format';

const initialMembers = [
  { name: 'Maya Chen', email: 'maya@storyline.studio', role: 'Editor in chief', status: 'Online', tone: 'green' },
  { name: 'Jon Bell', email: 'jon@storyline.studio', role: 'Senior editor', status: '2h ago', tone: 'sand' },
  { name: 'Nadia Khan', email: 'nadia@storyline.studio', role: 'Contributor', status: 'Yesterday', tone: 'violet' },
  { name: 'Elena Rossi', email: 'elena@storyline.studio', role: 'Design editor', status: '3h ago', tone: 'blue' },
  { name: 'Sam Rivera', email: 'sam@storyline.studio', role: 'Contributor', status: 'Aug 12', tone: 'rose' },
];

const roles = ['Contributor', 'Senior editor', 'Design editor', 'Administrator'];

function readStoredMembers() {
  try {
    const stored = JSON.parse(localStorage.getItem('storyline-team-members') || localStorage.getItem('storyline-invited-members') || '[]');
    if (!Array.isArray(stored) || !stored.length) return initialMembers;
    const isCompleteList = stored.some((member) => member.email === 'maya@storyline.studio');
    return isCompleteList ? stored : [...initialMembers, ...stored];
  } catch {
    return initialMembers;
  }
}

export default function UsersPage() {
  const { notify } = useCms();
  const [members, setMembers] = useState(readStoredMembers);
  const [modalOpen, setModalOpen] = useState(false);
  const [invite, setInvite] = useState({ name: '', email: '', role: 'Contributor' });
  const [errors, setErrors] = useState({});
  const [activeMenu, setActiveMenu] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem('storyline-team-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (!event.target.closest?.('.team-actions')) setActiveMenu('');
    };
    const onKeyDown = (event) => event.key === 'Escape' && setActiveMenu('');
    document.addEventListener('mousedown', closeMenus);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', closeMenus);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setInvite({ name: '', email: '', role: 'Contributor' });
    setErrors({});
  };

  const sendInvite = () => {
    const nextErrors = {};
    if (invite.name.trim().length < 2) nextErrors.name = 'Enter the teammate’s name.';
    if (!/^\S+@\S+\.\S+$/.test(invite.email)) nextErrors.email = 'Enter a valid email address.';
    if (members.some((member) => member.email.toLowerCase() === invite.email.toLowerCase())) nextErrors.email = 'This person is already on the team.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setMembers((items) => [...items, { ...invite, name: invite.name.trim(), email: invite.email.trim(), status: 'Invited', tone: 'blue' }]);
    notify(`Invitation sent to ${invite.email.trim()}`);
    closeModal();
  };

  const setField = (field, value) => {
    setInvite((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const changeRole = (member, role) => {
    setMembers((items) => items.map((item) => item.email === member.email ? { ...item, role } : item));
    setActiveMenu('');
    notify(`${member.name} is now ${role.toLowerCase()}`);
  };

  const removeMember = () => {
    if (!removeTarget) return;
    setMembers((items) => items.filter((item) => item.email !== removeTarget.email));
    notify(`${removeTarget.name} was removed from the workspace`, 'info');
    setRemoveTarget(null);
  };

  return (
    <div>
      <section className="page-heading"><div><p className="eyebrow">People</p><h2>Your editorial team</h2><p>Manage access and keep collaboration flowing.</p></div><button className="button button--primary" type="button" onClick={() => setModalOpen(true)}><Plus size={17} /> Invite member</button></section>
      <section className="panel team-panel">
        <div className="panel__heading"><div><h3>Team members</h3><p>{members.length} people have access to this workspace.</p></div></div>
        <div className="team-list">
          {members.map((member) => (
            <div className="team-row" key={member.email}>
              <span className={`avatar avatar--large avatar--${member.tone}`}>{initials(member.name)}</span>
              <div className="team-row__name"><strong>{member.name}</strong><span><Mail size={13} /> {member.email}</span></div>
              <span className="role-pill">{member.role}</span>
              <span className={`presence ${member.status === 'Online' ? 'is-online' : ''}`}><i />{member.status}</span>
              <div className="team-actions">
                <button className="icon-button" type="button" aria-label={`Manage ${member.name}`} aria-expanded={activeMenu === member.email} onClick={() => setActiveMenu((value) => value === member.email ? '' : member.email)}><MoreHorizontal size={18} /></button>
                {activeMenu === member.email && (
                  <div className="team-action-menu" role="menu" aria-label={`Manage ${member.name}`}>
                    <p>Change role</p>
                    {roles.map((role) => <button type="button" role="menuitem" key={role} onClick={() => changeRole(member, role)}>{member.role === role && <Check size={14} />}{role}</button>)}
                    <i />
                    <button className="is-danger" type="button" role="menuitem" disabled={member.email === 'maya@storyline.studio'} onClick={() => { setRemoveTarget(member); setActiveMenu(''); }}><Trash2 size={14} />Remove member</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal open={modalOpen} title="Invite a teammate" confirmLabel="Send invitation" onConfirm={sendInvite} onClose={closeModal} tone="brand" icon={UserPlus}>
        <p>They’ll receive an invitation to collaborate in this workspace.</p>
        <div className="modal-form-grid">
          <div className="modal-form-field">
            <label htmlFor="invite-name">Full name</label>
            <input id="invite-name" className="input" value={invite.name} onChange={(event) => setField('name', event.target.value)} placeholder="Taylor Reed" aria-invalid={!!errors.name} autoFocus />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="modal-form-field">
            <label htmlFor="invite-email">Email address</label>
            <input id="invite-email" className="input" type="email" value={invite.email} onChange={(event) => setField('email', event.target.value)} placeholder="taylor@example.com" aria-invalid={!!errors.email} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="modal-form-field">
            <label htmlFor="invite-role">Role</label>
            <select id="invite-role" className="input" value={invite.role} onChange={(event) => setField('role', event.target.value)}>
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={!!removeTarget} title="Remove this teammate?" confirmLabel="Remove member" onConfirm={removeMember} onClose={() => setRemoveTarget(null)}>
        <p><strong>{removeTarget?.name}</strong> will lose access to this workspace. You can invite them again later.</p>
      </Modal>
    </div>
  );
}
