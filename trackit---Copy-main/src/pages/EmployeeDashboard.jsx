import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Image/Untitled-design-7-1 (1).webp";
import axios from "axios";

const API_BASE = "https://trackit-copy.onrender.com/api";
const FRONTEND_URL = "https://trackit-copy.vercel.app";

const ClientOnboardingForm = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  const [activePage, setActivePage] = useState("onboarding");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedClientForAttachments, setSelectedClientForAttachments] = useState(null);

  const defaultForm = {
    clientName: "",
    clientPocName: "",
    clientPocEmail: "",
    clientPocMobile: "",
    clientVanderEmail: "",
    ourPocName: "",
    startDate: "",
    paymentTerms: "30",
    attachments: [],
  };

  const [clientForm, setClientForm] = useState(defaultForm);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      loadClients();
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  }, [navigate]);

  // ── Data Layer ─────────────────────────────────────────────────────────────
  const loadClients = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/clients`);
      setClients(
        (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (error) {
      console.error("Error loading clients:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("currentUser");
        navigate("/login");
      } else {
        alert("Failed to load clients. Please check the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async (clientData) => {
    const res = await axios.post(`${API_BASE}/add-client`, clientData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  };

  const updateClient = async (id, clientData) => {
    const res = await axios.put(`${API_BASE}/update-client/${id}`, clientData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  };

  const removeClientFromServer = async (id) => {
    await axios.delete(`${API_BASE}/delete-client/${id}`);
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const themeStyles = {
    background: isDarkMode ? "bg-gray-900" : "bg-gray-100",
    text: isDarkMode ? "text-white" : "text-gray-900",
    secondaryText: isDarkMode ? "text-gray-300" : "text-gray-600",
    card: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    sidebar: isDarkMode ? "bg-gray-900" : "bg-[#1a1a2e]",
    header: isDarkMode ? "bg-gray-800" : "bg-[#16213e]",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
    tableHeader: isDarkMode ? "bg-gray-700" : "bg-gray-200",
    tableRow: isDarkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-200 hover:bg-gray-50",
    button: isDarkMode
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-blue-500 hover:bg-blue-600",
    buttonSecondary: isDarkMode
      ? "bg-gray-600 hover:bg-gray-700"
      : "bg-gray-500 hover:bg-gray-600",
    buttonSuccess: isDarkMode
      ? "bg-green-600 hover:bg-green-700"
      : "bg-green-500 hover:bg-green-600",
    buttonDanger: isDarkMode
      ? "bg-red-600 hover:bg-red-700"
      : "bg-red-500 hover:bg-red-600",
  };

  // ── File Compression Function ─────────────────────────────────────────────
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7);
        };
        
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // ── Form Helpers ───────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsLoading(true);
    
    for (const file of files) {
      if (file.size > 3 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 3 MB limit. Please compress or use a smaller file.`);
        continue;
      }

      try {
        let processedFile = file;
        
        if (file.type.startsWith('image/')) {
          processedFile = await compressImage(file);
          console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        }
        
        const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}-${processedFile.name}`;
        
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
        
        const reader = new FileReader();
        
        reader.onerror = () => {
          alert(`Failed to read file "${processedFile.name}". Please try again.`);
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
        };
        
        reader.onload = (event) => {
          const fileData = {
            id: fileId,
            name: processedFile.name,
            type: processedFile.type,
            size: processedFile.size,
            data: event.target.result,
            uploadedAt: new Date().toISOString(),
          };
          
          setAttachments((prev) => {
            const updated = [...prev, fileData];
            setClientForm((prevForm) => ({ ...prevForm, attachments: updated }));
            return updated;
          });
          
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
          setTimeout(() => {
            setUploadProgress((prev) => {
              const updated = { ...prev };
              delete updated[fileId];
              return updated;
            });
          }, 1000);
        };
        
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Failed to process file "${file.name}". Please try again.`);
      }
    }
    
    setIsLoading(false);
    e.target.value = "";
  };

  const removeAttachment = (fileId) => {
    setAttachments((prev) => prev.filter((f) => f.id !== fileId));
    setClientForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((f) => f.id !== fileId),
    }));
  };

  // ── Enhanced File Download Function ──────────────────────────────────────
  const downloadFile = (file) => {
    try {
      if (!file.data) {
        alert("File data not available for download");
        return;
      }

      const link = document.createElement('a');
      
      if (file.data.startsWith('data:')) {
        link.href = file.data;
      } else {
        const mimeType = file.type || 'application/octet-stream';
        link.href = `data:${mimeType};base64,${file.data}`;
      }
      
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
      
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  // ── View Attachments Modal ─────────────────────────────────────────────────
  const viewAttachments = (client) => {
    setSelectedClientForAttachments(client);
    setShowAttachmentsModal(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetForm = () => {
    setClientForm(defaultForm);
    setAttachments([]);
    setSelectedClient(null);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clientForm.clientName?.trim()) { alert("Client Name is required."); return false; }
    if (!clientForm.clientPocName?.trim()) { alert("Client POC Name is required."); return false; }
    if (!clientForm.clientPocEmail?.trim()) { alert("Client POC Email is required."); return false; }
    if (!emailRegex.test(clientForm.clientPocEmail)) { alert("Please enter a valid Client POC email address."); return false; }
    if (!clientForm.clientPocMobile?.trim()) { alert("Client POC Mobile Number is required."); return false; }
    const mobileDigits = clientForm.clientPocMobile.replace(/\D/g, "");
    if (mobileDigits.length !== 10) { alert("Please enter a valid 10-digit mobile number."); return false; }
    if (clientForm.clientVanderEmail && !emailRegex.test(clientForm.clientVanderEmail)) {
      alert("Please enter a valid Vendor email address."); return false;
    }
    if (!clientForm.ourPocName?.trim()) { alert("Our POC Name is required."); return false; }
    if (!clientForm.startDate) { alert("Start Date is required."); return false; }
    
    const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      alert("Total attachments size exceeds 10 MB. Please remove some files.");
      return false;
    }
    
    return true;
  };

  // ── Save / Update ──────────────────────────────────────────────────────────
  const saveClient = async () => {
    if (!validateForm()) return;
    if (!currentUser) { alert("User not authenticated."); return; }

    const mobileDigits = clientForm.clientPocMobile.replace(/\D/g, "");
    const formattedMobile = mobileDigits.replace(/(\d{5})(\d{5})/, "$1-$2");
    const now = new Date().toISOString();

    const clientData = {
      ...clientForm,
      clientPocMobile: formattedMobile,
      attachments,
      createdBy: currentUser.id,
      updatedAt: now,
      ...(selectedClient ? { createdAt: selectedClient.createdAt } : { createdAt: now }),
    };

    setIsLoading(true);
    try {
      if (selectedClient) {
        const id = selectedClient._id || selectedClient.id;
        const updated = await updateClient(id, clientData);
        setClients((prev) =>
          prev
            .map((c) => (c._id === id || c.id === id ? updated : c))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        alert("Client updated successfully!");
        resetForm();
      } else {
        await createClient(clientData);
        await loadClients();
        alert("Client onboarded successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Error saving client:", error);
      if (error.response?.status === 413) {
        alert("File size too large. Please compress images or use smaller files (max 3MB per file, 10MB total).");
      } else if (error.response?.status === 401) {
        localStorage.removeItem("currentUser");
        navigate("/login");
      } else {
        alert("Failed to save client. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Edit / Delete ──────────────────────────────────────────────────────────
  const editClient = (client) => {
    setSelectedClient(client);
    setClientForm(client);
    setAttachments(client.attachments || []);
    setActivePage("onboarding");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const deleteClient = async () => {
    if (!clientToDelete) return;
    const id = clientToDelete._id || clientToDelete.id;
    setIsLoading(true);
    try {
      await removeClientFromServer(id);
      setClients((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      if (selectedClient?._id === id || selectedClient?.id === id) resetForm();
      setShowDeleteModal(false);
      setClientToDelete(null);
      alert("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("currentUser");
        navigate("/login");
      } else {
        alert("Failed to delete client. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived State ──────────────────────────────────────────────────────────
  const filteredClients = clients.filter(
    (client) =>
      client.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientPocName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ourPocName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientPocEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientVanderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientPocMobile?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "📕";
    if (fileType?.includes("image")) return "🖼️";
    if (fileType?.includes("word") || fileType?.includes("document")) return "📝";
    if (fileType?.includes("excel") || fileType?.includes("spreadsheet")) return "📊";
    if (fileType?.includes("text")) return "📄";
    return "📎";
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex min-h-screen ${themeStyles.background} ${themeStyles.text} transition-colors duration-200`}>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeStyles.card} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete client "{clientToDelete?.clientName}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setClientToDelete(null); }}
                className={`px-4 py-2 rounded ${themeStyles.buttonSecondary} text-white`}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={deleteClient}
                className={`px-4 py-2 rounded ${themeStyles.buttonDanger} text-white`}
                disabled={isLoading}
              >
                {isLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Modal */}
      {showAttachmentsModal && selectedClientForAttachments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeStyles.card} p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit z-10 pb-2">
              <div>
                <h3 className="text-xl font-semibold">
                  Attachments - {selectedClientForAttachments.clientName}
                </h3>
                <p className={`text-sm ${themeStyles.secondaryText} mt-1`}>
                  {selectedClientForAttachments.attachments?.length || 0} file(s) attached
                </p>
              </div>
              <button
                onClick={() => setShowAttachmentsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {selectedClientForAttachments.attachments?.length > 0 ? (
              <div className="space-y-3">
                {selectedClientForAttachments.attachments.map((file, index) => (
                  <div
                    key={file.id || index}
                    className={`flex items-center justify-between p-4 ${themeStyles.border} border rounded-lg hover:shadow-md transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-3xl">
                        {getFileIcon(file.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <p className={`text-xs ${themeStyles.secondaryText}`}>
                            {formatFileSize(file.size)}
                          </p>
                          <p className={`text-xs ${themeStyles.secondaryText}`}>
                            Uploaded {formatDate(file.uploadedAt)}
                          </p>
                          {file.type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadFile(file)}
                        className={`px-4 py-2 rounded-lg text-white ${themeStyles.button} flex items-center gap-2 transition-colors hover:scale-105`}
                        title="Download"
                      >
                        <span>📥</span>
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      {file.type?.includes('image') && (
                        <button
                          onClick={() => {
                            const imageWindow = window.open();
                            if (imageWindow && file.data) {
                              imageWindow.document.write(`
                                <html>
                                  <head>
                                    <title>${file.name}</title>
                                    <style>
                                      body {
                                        margin: 0;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        min-height: 100vh;
                                        background: #1a1a1a;
                                      }
                                      img {
                                        max-width: 100%;
                                        max-height: 100vh;
                                        object-fit: contain;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <img src="${file.data}" alt="${file.name}" />
                                  </body>
                                </html>
                              `);
                              imageWindow.document.close();
                            }
                          }}
                          className={`px-4 py-2 rounded-lg text-white ${themeStyles.buttonSecondary} flex items-center gap-2 transition-colors hover:scale-105`}
                          title="Preview"
                        >
                          <span>👁️</span>
                          <span className="hidden sm:inline">Preview</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block opacity-50">📂</span>
                <p className={`text-lg ${themeStyles.secondaryText}`}>No attachments found</p>
                <p className={`text-sm ${themeStyles.secondaryText} mt-2`}>
                  This client has no uploaded files
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={`w-64 ${themeStyles.sidebar} text-white flex flex-col`}>
        <div className="p-6 text-center border-b border-gray-700">
          <img src={logo} alt="Company Logo" className="h-12 w-auto mx-auto mb-3 bg-white p-1 rounded-lg" />
          <h1 className="text-xl font-bold text-yellow-400">Client Onboarding</h1>
          <p className="text-sm text-gray-400 mt-1">{currentUser.employeeId}</p>
        </div>

        <ul className="mt-4 flex-1">
          <li
            onClick={() => setActivePage("onboarding")}
            className={`px-6 py-3 cursor-pointer transition-colors flex items-center gap-2 ${
              activePage === "onboarding" ? "bg-blue-600" : "hover:bg-blue-500"
            }`}
          >
            <span>📝</span> New Client
          </li>
          <li
            onClick={() => setActivePage("clients")}
            className={`px-6 py-3 cursor-pointer transition-colors flex items-center gap-2 ${
              activePage === "clients" ? "bg-blue-600" : "hover:bg-blue-500"
            }`}
          >
            <span>👥</span> Client List
          </li>
        </ul>

        <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
          <div className="mb-2">
            <p className="font-medium text-gray-300">Total Clients</p>
            <p className="text-xl text-yellow-400">{clients.length}</p>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <img src={logo} alt="" className="h-4 w-auto opacity-50" />
            <span>© 2024 All rights reserved</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className={`${themeStyles.header} text-white flex justify-between items-center p-4`}>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-8 w-auto bg-white p-1 rounded" />
            <h1 className="text-xl font-semibold">
              {activePage === "onboarding" && (selectedClient ? "✏️ Edit Client" : "New Client Onboarding")}
              {activePage === "clients" && "👥 Client List"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <span className="text-sm hidden md:block">
              {new Date().toLocaleDateString("en-IN")}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── ONBOARDING FORM ── */}
          {activePage === "onboarding" && (
            <div className="max-w-4xl mx-auto">
              <div className={`${themeStyles.card} p-6 rounded-lg shadow-lg mb-6`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedClient ? "Edit Client" : "Onboard New Client"}
                    </h2>
                    <p className={`text-sm ${themeStyles.secondaryText} mt-1`}>
                      Fill in the client details below
                    </p>
                  </div>
                  {selectedClient && (
                    <button
                      onClick={resetForm}
                      className={`px-4 py-2 rounded text-white ${themeStyles.buttonSecondary} transition-colors`}
                    >
                      New Client
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Client Name */}
                  <div>
                    <label className="block mb-2 font-medium">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={clientForm.clientName}
                      onChange={handleInputChange}
                      className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                      placeholder="Enter client company name"
                      autoComplete="off"
                    />
                  </div>

                  {/* Client POC Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium">
                        Client POC Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="clientPocName"
                        value={clientForm.clientPocName}
                        onChange={handleInputChange}
                        className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                        placeholder="Enter client point of contact name"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">
                        Client POC Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="clientPocEmail"
                        value={clientForm.clientPocEmail}
                        onChange={handleInputChange}
                        className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                        placeholder="Enter client POC email"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Mobile & Vendor Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium">
                        Client POC Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="clientPocMobile"
                        value={clientForm.clientPocMobile}
                        onChange={handleInputChange}
                        className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                        autoComplete="off"
                      />
                      <p className={`text-xs ${themeStyles.secondaryText} mt-1`}>
                        Enter 10-digit mobile number
                      </p>
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">Client Vendor Email</label>
                      <input
                        type="email"
                        name="clientVanderEmail"
                        value={clientForm.clientVanderEmail}
                        onChange={handleInputChange}
                        className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                        placeholder="Enter client vendor email"
                        autoComplete="off"
                      />
                      <p className={`text-xs ${themeStyles.secondaryText} mt-1`}>
                        Optional: vendor email for billing
                      </p>
                    </div>
                  </div>

                  {/* Our POC Name & Start Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium">
                        Our POC Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ourPocName"
                        value={clientForm.ourPocName}
                        onChange={handleInputChange}
                        className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                        placeholder="Enter our point of contact name"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={clientForm.startDate}
                        onChange={handleInputChange}
                        className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                      />
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <label className="block mb-2 font-medium">
                      Payment Terms <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentTerms"
                      value={clientForm.paymentTerms}
                      onChange={handleInputChange}
                      className={`${themeStyles.input} border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                    >
                      <option value="15">15 Days</option>
                      <option value="30">30 Days</option>
                      <option value="45">45 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Attachments */}
                  <div className="border-t pt-6">
                    <label className="block mb-4 font-medium text-lg">📎 Attachments (Max 3MB per file, 10MB total)</label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
                    />
                    <div
                      className={`border-2 border-dashed ${themeStyles.border} rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer`}
                      onClick={() => document.getElementById("file-upload").click()}
                    >
                      <div className="space-y-2">
                        <span className="text-4xl block">📁</span>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className={`text-sm ${themeStyles.secondaryText}`}>
                          Supported: PDF, DOC, DOCX, XLS, XLSX, Images (JPG, PNG, GIF, BMP), TXT (max 3 MB each)
                        </p>
                      </div>
                    </div>

                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(uploadProgress).map(([fileId, progress]) => (
                          <div key={fileId} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium mb-2">Uploaded Files:</h4>
                        {attachments.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-3 ${themeStyles.border} border rounded-lg`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-2xl">
                                {getFileIcon(file.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className={`text-xs ${themeStyles.secondaryText}`}>
                                  {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => downloadFile(file)}
                                className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Download"
                              >
                                📥
                              </button>
                              <button
                                onClick={() => removeAttachment(file.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                title="Remove"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={saveClient}
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-lg text-white ${themeStyles.buttonSuccess} transition-colors flex items-center gap-2 flex-1 justify-center font-medium disabled:opacity-60`}
                    >
                      <span>💾</span>
                      {isLoading ? "Saving…" : selectedClient ? "Update Client" : "Save Client"}
                    </button>
                    {selectedClient && (
                      <button
                        onClick={resetForm}
                        disabled={isLoading}
                        className={`px-6 py-3 rounded-lg text-white ${themeStyles.buttonSecondary} transition-colors flex items-center gap-2 justify-center font-medium disabled:opacity-60`}
                      >
                        <span>🔄</span> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CLIENT LIST ── */}
          {activePage === "clients" && (
            <div className={`${themeStyles.card} p-6 rounded-lg shadow-lg`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <h2 className="text-xl font-semibold">Client List</h2>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    {filteredClients.length} total
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search clients…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${themeStyles.input} border p-2 rounded-lg w-full md:w-64`}
                  />
                  <button
                    onClick={() => { resetForm(); setActivePage("onboarding"); }}
                    className={`px-4 py-2 rounded-lg text-white ${themeStyles.button} flex items-center gap-2 justify-center whitespace-nowrap`}
                  >
                    <span>➕</span> Add New
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
                  <p className={`mt-4 ${themeStyles.secondaryText}`}>Loading clients…</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block opacity-50">👥</span>
                  <p className={`text-lg ${themeStyles.secondaryText} mb-2`}>No clients found</p>
                  <p className={`text-sm ${themeStyles.secondaryText} mb-4`}>
                    {searchTerm ? "Try a different search term" : "Add your first client to get started"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setActivePage("onboarding")}
                      className={`px-6 py-2 rounded-lg text-white ${themeStyles.button} inline-flex items-center gap-2`}
                    >
                      <span>➕</span> Add New Client
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={themeStyles.tableHeader}>
                        <th className="p-3 text-left">S.No</th>
                        <th className="p-3 text-left">Client Name</th>
                        <th className="p-3 text-left">Client POC Name</th>
                        <th className="p-3 text-left">Client POC Email</th>
                        <th className="p-3 text-left">Client POC Mobile</th>
                        <th className="p-3 text-left">Client Vendor Email</th>
                        <th className="p-3 text-left">Our POC Name</th>
                        <th className="p-3 text-left">Start Date</th>
                        <th className="p-3 text-left">Payment Terms</th>
                        <th className="p-3 text-left">Attachments</th>
                        <th className="p-3 text-left">Added On</th>
                        <th className="p-3 text-left">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client, index) => (
                        <tr
                          key={client._id || client.id}
                          className={`border-b ${themeStyles.border} ${themeStyles.tableRow}`}
                        >
                          <td className="p-3 text-sm">{index + 1}</td>
                          <td className="p-3 font-medium">{client.clientName}</td>
                          <td className="p-3">{client.clientPocName}</td>
                          <td className="p-3">
                            <a href={`mailto:${client.clientPocEmail}`} className="text-blue-500 hover:underline">
                              {client.clientPocEmail}
                            </a>
                          </td>
                          <td className="p-3">
                            <a href={`tel:${client.clientPocMobile}`} className="text-blue-500 hover:underline">
                              {client.clientPocMobile}
                            </a>
                          </td>
                          <td className="p-3">
                            {client.clientVanderEmail ? (
                              <a href={`mailto:${client.clientVanderEmail}`} className="text-blue-500 hover:underline">
                                {client.clientVanderEmail}
                              </a>
                            ) : "-"}
                          </td>
                          <td className="p-3">{client.ourPocName}</td>
                          <td className="p-3">
                            {client.startDate ? new Date(client.startDate).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td className="p-3">{client.paymentTerms || "30"} Days</td>
                          <td className="p-3">
                            {client.attachments?.length > 0 ? (
                              <button
                                onClick={() => viewAttachments(client)}
                                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                                title="View and download attachments"
                              >
                                📎 {client.attachments.length} file(s)
                              </button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-sm">{formatDate(client.createdAt)}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editClient(client)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit Client"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => confirmDelete(client)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete Client"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingForm;