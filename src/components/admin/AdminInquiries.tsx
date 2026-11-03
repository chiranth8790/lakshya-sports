import { useState, useEffect } from 'react';
import { Mail, Phone, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../library/supabase';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInquiries(data);
      }
    } catch (err) {
      console.warn('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (!error) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const q = searchTerm.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.phone && inq.phone.includes(q)) ||
      (inq.subject && inq.subject.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Customer Inquiries & Support</h1>
          <p className="text-xs text-gray-500 font-semibold">Messages and gear requests submitted through the contact form.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Inquiries...</p>
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredInquiries.map((inq) => (
              <div key={inq.id} className="p-6 hover:bg-gray-50/70 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{inq.name}</span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(inq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      inq.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : inq.status === 'In Progress' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {inq.status || 'New'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-mono text-gray-700">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`mailto:${inq.email}`} className="hover:underline">{inq.email}</a>
                    </span>
                    {inq.phone && (
                      <span className="flex items-center gap-1 font-mono text-gray-700">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`tel:${inq.phone}`} className="hover:underline">{inq.phone}</a>
                      </span>
                    )}
                  </div>

                  {inq.subject && (
                    <div className="text-xs font-bold text-red-600 tracking-wide uppercase pt-1">
                      {inq.subject}
                    </div>
                  )}

                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={inq.status || 'New'}
                    disabled={updatingId === inq.id}
                    onChange={(e) => updateStatus(inq.id, e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">No Inquiries Found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm ? 'No inquiries match your search query.' : 'Customer messages submitted via the Contact page will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
