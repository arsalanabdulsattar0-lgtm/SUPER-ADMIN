import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2, Check,
  ChevronLeft, ChevronRight, Copy, ArrowLeft,
  Move, Settings, ChevronDown, ChevronUp,
  Download, Upload, FileText, Undo, Redo, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import {
  seedPrintTemplates,
  getSeedTemplateFields,
  getSeedTemplateSections,
  getSeedTemplateColumns,
  getSeedCustomFields
} from '../../../utils/settingsData';
import type {
  PrintTemplate,
  PrintTemplateSection,
  PrintTemplateField,
  PrintTemplateCustomField,
  PrintTemplateColumn,
  FormulaToken
} from '../../../utils/settingsData';
import { FORMULA_FIELD_OPTIONS } from '../../../utils/settingsData';
import {
  loadTemplatesFromApi,
  saveTemplatesToApi,
  saveSingleTemplateLayout
} from '../../../utils/templateApi';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { AlertModal } from '../../../components/ui/AlertModal';

const dummyContext = {
  row: {
    quantity: 5,
    price: 1500,
    discount: 250,
    tax: 625,
    furtherTax: 0
  },
  totals: {
    subtotal: 7500,
    tax_amount: 1125,
    discount_amount: 500,
    shipping_charges: 150,
    other_charges: 0,
    round_off: 0,
    grand_total: 8275,
    paid_amount: 5000,
    balance_due: 3275,
    total_qty: 12,
    total_items: 3
  }
};

interface PrintTemplatesModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const PAGE_SIZE = 10;

const DOCUMENT_TYPES = [
  'Sales Invoice',
  'Sales Return',
  'Service Invoice',
  'Purchase Invoice',
  'Purchase Return',
  'Quotation',
  'Delivery Note',
  'Credit Note',
  'Debit Note'
];

const PAPER_SIZES = ['A4', 'Letter', 'Thermal', 'Custom'];
const ORIENTATIONS = ['Portrait', 'Landscape'];

const parseCustomCss = (cssString?: string): React.CSSProperties => {
  if (!cssString) return {};
  const styles: any = {};
  cssString.split(';').forEach(rule => {
    const parts = rule.split(':');
    if (parts.length >= 2) {
      const prop = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (prop && val) {
        const key = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[key] = val;
      }
    }
  });
  return styles;
};

export const PrintTemplatesModule: React.FC<PrintTemplatesModuleProps> = ({ brand }) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<PrintTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('print_templates');
      if (stored) {
        const parsed: PrintTemplate[] = JSON.parse(stored);
        // Filter out only the old deleted static default templates (pt-1 to pt-12)
        // while keeping the 5 Sales Return (srt-) templates and any user-customized/imported templates (pt-[timestamp]).
        const deletedIds = new Set(['pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9', 'pt-10', 'pt-11', 'pt-12']);
        const filtered = parsed.filter(t => !deletedIds.has(t.template_id));
        if (filtered.length !== parsed.length || filtered.length < seedPrintTemplates.length) {
          const storedIds = new Set(filtered.map(t => t.template_id));
          const missing = seedPrintTemplates.filter(t => !storedIds.has(t.template_id));
          const merged = [...filtered, ...missing];
          localStorage.setItem('print_templates', JSON.stringify(merged));
          return merged;
        }
        return filtered;
      }
      return seedPrintTemplates;
    } catch {
      return seedPrintTemplates;
    }
  });

  const [allSections, setAllSections] = useState<PrintTemplateSection[]>(() => {
    let loaded: PrintTemplateSection[] = [];
    try {
      const stored = localStorage.getItem('print_template_sections');
      if (stored) loaded = JSON.parse(stored);
    } catch {}

    const initialTemplates: PrintTemplate[] = (() => {
      try {
        const storedT = localStorage.getItem('print_templates');
        return storedT ? JSON.parse(storedT) : seedPrintTemplates;
      } catch {
        return seedPrintTemplates;
      }
    })();

    if (loaded.length === 0) {
      const initialSections: PrintTemplateSection[] = [];
      initialTemplates.forEach((t: PrintTemplate) => {
        initialSections.push(...getSeedTemplateSections(t.template_id));
      });
      return initialSections;
    }

    const updatedSections = [...loaded];
    initialTemplates.forEach((t: PrintTemplate) => {
      const seedSections = getSeedTemplateSections(t.template_id);
      const existingForT = updatedSections.filter(s => s.template_id === t.template_id);
      seedSections.forEach(ss => {
        const hasSec = existingForT.some(es => es.section_name === ss.section_name);
        if (!hasSec) {
          updatedSections.push(ss);
        }
      });
    });
    return updatedSections;
  });

  const [allFields, setAllFields] = useState<PrintTemplateField[]>(() => {
    let loaded: PrintTemplateField[] = [];
    try {
      const stored = localStorage.getItem('print_template_fields');
      if (stored) loaded = JSON.parse(stored);
    } catch {}

    const initialTemplates: PrintTemplate[] = (() => {
      try {
        const storedT = localStorage.getItem('print_templates');
        return storedT ? JSON.parse(storedT) : seedPrintTemplates;
      } catch {
        return seedPrintTemplates;
      }
    })();

    if (loaded.length === 0) {
      const initialFields: PrintTemplateField[] = [];
      initialTemplates.forEach((t: PrintTemplate) => {
        initialFields.push(...getSeedTemplateFields(t.template_id));
      });
      return initialFields;
    }

    const updatedFields = loaded.map(f => {
      if (f.position_x === undefined || f.position_y === undefined) {
        const seeds = getSeedTemplateFields(f.template_id);
        const match = seeds.find(sf => sf.field_name === f.field_name);
        if (match) {
          return {
            ...f,
            position_x: f.position_x ?? match.position_x,
            position_y: f.position_y ?? match.position_y,
            width_percent: f.width_percent ?? match.width_percent,
          };
        }
      }
      return f;
    });
    initialTemplates.forEach((t: PrintTemplate) => {
      const seedFields = getSeedTemplateFields(t.template_id);
      const existingForT = updatedFields.filter(f => f.template_id === t.template_id);
      seedFields.forEach(sf => {
        const hasField = existingForT.some(ef => ef.field_name === sf.field_name);
        if (!hasField) {
          updatedFields.push(sf);
        }
      });
    });
    return updatedFields;
  });

  const [allColumns, setAllColumns] = useState<PrintTemplateColumn[]>(() => {
    let loaded: PrintTemplateColumn[] = [];
    try {
      const stored = localStorage.getItem('print_template_columns');
      if (stored) loaded = JSON.parse(stored);
    } catch {}

    const initialTemplates: PrintTemplate[] = (() => {
      try {
        const storedT = localStorage.getItem('print_templates');
        return storedT ? JSON.parse(storedT) : seedPrintTemplates;
      } catch {
        return seedPrintTemplates;
      }
    })();

    if (loaded.length === 0) {
      const initialColumns: PrintTemplateColumn[] = [];
      initialTemplates.forEach((t: PrintTemplate) => {
        initialColumns.push(...getSeedTemplateColumns(t.template_id));
      });
      return initialColumns;
    }

    const updatedColumns = [...loaded];
    initialTemplates.forEach((t: PrintTemplate) => {
      const seedColumns = getSeedTemplateColumns(t.template_id);
      const existingForT = updatedColumns.filter(c => c.template_id === t.template_id);
      seedColumns.forEach(sc => {
        const hasCol = existingForT.some(ec => ec.column_name === sc.column_name);
        if (!hasCol) {
          updatedColumns.push(sc);
        }
      });
    });
    return updatedColumns;
  });

  const [allCustomFields, setAllCustomFields] = useState<PrintTemplateCustomField[]>(() => {
    try {
      const stored = localStorage.getItem('print_template_custom_fields');
      if (stored) return JSON.parse(stored);
    } catch {}
    const seed: PrintTemplateCustomField[] = [];
    seedPrintTemplates.map(t => t.template_id).forEach(tId => {
      seed.push(...getSeedCustomFields(tId));
    });
    return seed;
  });

  // Save states to localStorage and sync to backend API if enabled
  useEffect(() => {
    localStorage.setItem('print_templates', JSON.stringify(templates));
    saveTemplatesToApi('templates', templates);
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('print_template_sections', JSON.stringify(allSections));
    saveTemplatesToApi('sections', allSections);
  }, [allSections]);

  useEffect(() => {
    localStorage.setItem('print_template_fields', JSON.stringify(allFields));
    saveTemplatesToApi('fields', allFields);
  }, [allFields]);

  useEffect(() => {
    localStorage.setItem('print_template_columns', JSON.stringify(allColumns));
    saveTemplatesToApi('columns', allColumns);
  }, [allColumns]);

  useEffect(() => {
    localStorage.setItem('print_template_custom_fields', JSON.stringify(allCustomFields));
    saveTemplatesToApi('customFields', allCustomFields);
  }, [allCustomFields]);

  // Load templates from Backend API on mount if enabled
  useEffect(() => {
    async function syncFromBackend() {
      const serverData = await loadTemplatesFromApi();
      if (serverData) {
        setTemplates(serverData.templates);
        setAllSections(serverData.sections);
        setAllFields(serverData.fields);
        setAllColumns(serverData.columns);
        setAllCustomFields(serverData.customFields);
      }
    }
    syncFromBackend();
  }, []);

  const [view, setView] = useState<'list' | 'designer'>('list');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  // List search & filter states
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterDocType, setFilterDocType] = useState('all');
  const [filterPaper, setFilterPaper] = useState('all');
  const [tempDocType, setTempDocType] = useState('all');
  const [tempPaper, setTempPaper] = useState('all');
  const [sortKey, setSortKey] = useState<keyof PrintTemplate>('template_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer/Modal Form states
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [form, setForm] = useState<Omit<PrintTemplate, 'template_id'>>({
    template_name: '',
    document_type: 'Sales Invoice',
    paper_size: 'A4',
    orientation: 'Portrait',
    is_default: false,
    is_active: true,
    logo_size: 80,
    qr_enabled: true,
    barcode_enabled: false,
    signature_enabled: true,
    watermark_enabled: false,
    terms_enabled: true,
    remarks_enabled: true
  });
  const [formError, setFormError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'warning' | 'error' | 'info' }>({ isOpen: false, title: '', message: '' });
  

  // Designer local states
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [selectedCustomFieldId, setSelectedCustomFieldId] = useState<string | null>(null);

  // Modals for Top Toolbar Managers
  const [showLayoutModal, setShowLayoutModal] = useState<boolean>(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [showFormulasModal, setShowFormulasModal] = useState<boolean>(false);
  const [showTemplateSettingsModal, setShowTemplateSettingsModal] = useState<boolean>(false);
  const [editingFormulaId, setEditingFormulaId] = useState<string | null>(null);

  // Modals for Double Click Properties Editing
  const [showFieldPropertiesModal, setShowFieldPropertiesModal] = useState<boolean>(false);
  const [showColumnPropertiesModal, setShowColumnPropertiesModal] = useState<boolean>(false);
  const [showSectionPropertiesModal, setShowSectionPropertiesModal] = useState<boolean>(false);

  // Active item for Section Properties modal
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Search query inside Fields Manager Modal
  const [fieldsSearchQuery, setFieldsSearchQuery] = useState<string>('');

  // Zoom level for Preview Canvas
  const [zoomLevel, setZoomLevel] = useState<'50' | '75' | '100' | '125' | 'fit'>('100');

  // Tab state for Field Properties Modal
  const [activeElementTab, setActiveElementTab] = useState<'content' | 'style'>('content');

  const [dragOverField, setDragOverField] = useState<{ id: string; pos: 'left' | 'right' | 'top' | 'bottom' } | null>(null);
  

  // Free Layout Mode Draggability and Renaming States
  const canvasRef = useRef<HTMLDivElement>(null);

  // States and refs for standard preview scaling
  const [previewScale, setPreviewScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const innerContentRef = useRef<HTMLDivElement | null>(null);

  const containerResizeObserverRef = useRef<ResizeObserver | null>(null);
  const innerResizeObserverRef = useRef<ResizeObserver | null>(null);

  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (containerResizeObserverRef.current) {
      containerResizeObserverRef.current.disconnect();
      containerResizeObserverRef.current = null;
    }

    previewContainerRef.current = node;

    if (node) {
      const updateWidth = () => {
        const width = node.clientWidth - 32; // subtract p-4 padding on both sides
        setContainerWidth(Math.max(0, width));
      };
      
      updateWidth();
      
      const observer = new ResizeObserver(() => {
        updateWidth();
      });
      observer.observe(node);
      containerResizeObserverRef.current = observer;
    }
  }, []);

  const innerContentRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (innerResizeObserverRef.current) {
      innerResizeObserverRef.current.disconnect();
      innerResizeObserverRef.current = null;
    }

    innerContentRef.current = node;

    if (node) {
      const updateHeight = () => {
        setContentHeight(node.scrollHeight);
      };
      
      updateHeight();
      
      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(node);
      innerResizeObserverRef.current = observer;
    } else {
      setContentHeight(0);
    }
  }, []);

  // Clean up observers on unmount
  useEffect(() => {
    return () => {
      if (containerResizeObserverRef.current) {
        containerResizeObserverRef.current.disconnect();
      }
      if (innerResizeObserverRef.current) {
        innerResizeObserverRef.current.disconnect();
      }
    };
  }, []);

  const [draggingElement, setDraggingElement] = useState<{
    id: string;
    type: 'default' | 'custom';
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelText, setEditingLabelText] = useState('');

  // Undo/Redo History States
  interface HistorySnapshot {
    templates: PrintTemplate[];
    allSections: PrintTemplateSection[];
    allFields: PrintTemplateField[];
    allColumns: PrintTemplateColumn[];
    allCustomFields: PrintTemplateCustomField[];
  }

  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const lastHistoryStateRef = useRef<HistorySnapshot | null>(null);
  const isUndoRedoActionRef = useRef<boolean>(false);

  // ─── Undo/Redo History Effect ──────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'designer') {
      if (history.length > 0) {
        setHistory([]);
        setHistoryIndex(-1);
        lastHistoryStateRef.current = null;
      }
      return;
    }

    const currentSnapshot: HistorySnapshot = {
      templates,
      allSections,
      allFields,
      allColumns,
      allCustomFields
    };

    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      lastHistoryStateRef.current = currentSnapshot;
      return;
    }

    if (!lastHistoryStateRef.current) {
      setHistory([currentSnapshot]);
      setHistoryIndex(0);
      lastHistoryStateRef.current = currentSnapshot;
      return;
    }

    const changed = 
      lastHistoryStateRef.current.templates !== templates ||
      lastHistoryStateRef.current.allSections !== allSections ||
      lastHistoryStateRef.current.allFields !== allFields ||
      lastHistoryStateRef.current.allColumns !== allColumns ||
      lastHistoryStateRef.current.allCustomFields !== allCustomFields;

    if (changed) {
      setHistory(prev => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, currentSnapshot];
      });
      setHistoryIndex(prev => prev + 1);
      lastHistoryStateRef.current = currentSnapshot;
    }
  }, [view, templates, allSections, allFields, allColumns, allCustomFields, historyIndex, history.length]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const snapshot = history[prevIdx];
      isUndoRedoActionRef.current = true;
      setHistoryIndex(prevIdx);
      
      setTemplates(snapshot.templates);
      setAllSections(snapshot.allSections);
      setAllFields(snapshot.allFields);
      setAllColumns(snapshot.allColumns);
      setAllCustomFields(snapshot.allCustomFields);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const snapshot = history[nextIdx];
      isUndoRedoActionRef.current = true;
      setHistoryIndex(nextIdx);

      setTemplates(snapshot.templates);
      setAllSections(snapshot.allSections);
      setAllFields(snapshot.allFields);
      setAllColumns(snapshot.allColumns);
      setAllCustomFields(snapshot.allCustomFields);
    }
  };

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    if (view !== 'designer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [view, historyIndex, history]);

  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'default' | 'custom',
    currentX: number,
    currentY: number
  ) => {
    if (activeTemplate?.layout_mode !== 'free') return;
    
    // Only allow left click dragging
    if (e.button !== 0) return;
    
    // Check if double click input is active, don't drag if so
    if (editingLabelId === id) return;

    e.stopPropagation();
    
    setDraggingElement({
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: currentX,
      startTop: currentY
    });
  };

  useEffect(() => {
    if (!draggingElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const deltaX = e.clientX - draggingElement.startX;
      const deltaY = e.clientY - draggingElement.startY;
      
      const pctDeltaX = (deltaX / rect.width) * 100;
      const pctDeltaY = (deltaY / rect.height) * 100;
      
      let newX = Math.round(draggingElement.startLeft + pctDeltaX);
      let newY = Math.round(draggingElement.startTop + pctDeltaY);
      
      // Keep boundaries [0, 100]
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      
      if (draggingElement.type === 'default') {
        updateFieldProperty(draggingElement.id, { position_x: newX, position_y: newY });
      } else {
        updateCustomFieldProperty(draggingElement.id, { position_x: newX, position_y: newY });
      }
    };

    const handleMouseUp = () => {
      setDraggingElement(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElement]);

  const [resizingElement, setResizingElement] = useState<{
    id: string;
    type: 'default' | 'custom';
    startX: number;
    startY: number;
    startWidthPercent: number;
    startHeightPx: number;
  } | null>(null);

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'default' | 'custom',
    currentWidthPercent: number,
    currentHeightPx: number | undefined,
    element: HTMLElement | null
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;

    const initialHeight = currentHeightPx ?? (element ? element.offsetHeight : 30);

    setResizingElement({
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startWidthPercent: currentWidthPercent,
      startHeightPx: initialHeight
    });
  };

  useEffect(() => {
    if (!resizingElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const deltaX = e.clientX - resizingElement.startX;
      const deltaY = e.clientY - resizingElement.startY;
      
      const pctDeltaX = (deltaX / rect.width) * 100;
      
      let newWidth = Math.round(resizingElement.startWidthPercent + pctDeltaX);
      let newHeight = Math.round(resizingElement.startHeightPx + (deltaY / previewScale));
      
      newWidth = Math.max(1, Math.min(100, newWidth));
      newHeight = Math.max(10, Math.min(2000, newHeight));
      
      if (resizingElement.type === 'default') {
        updateFieldProperty(resizingElement.id, { width_percent: newWidth, height_px: newHeight });
      } else {
        updateCustomFieldProperty(resizingElement.id, { width_percent: newWidth, height_px: newHeight });
      }
    };

    const handleMouseUp = () => {
      setResizingElement(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingElement]);

  const handleDoubleClick = (e: React.MouseEvent, id: string, _currentLabel?: string) => {
    e.stopPropagation();
    const isCustom = activeCustomFields.some(cf => cf.custom_field_id === id);
    const isColumn = activeColumns.some(col => col.column_id === id);
    
    if (isColumn) {
      setSelectedColumnId(id);
      setSelectedFieldId(null);
      setSelectedCustomFieldId(null);
      setShowColumnPropertiesModal(true);
    } else if (isCustom) {
      setSelectedCustomFieldId(id);
      setSelectedFieldId(null);
      setSelectedColumnId(null);
      setShowFieldPropertiesModal(true);
    } else {
      setSelectedFieldId(id);
      setSelectedCustomFieldId(null);
      setSelectedColumnId(null);
      setShowFieldPropertiesModal(true);
    }
  };

  const moveFieldOrder = (itemId: string, isCustom: boolean, direction: 'up' | 'down') => {
    const field = isCustom 
      ? allCustomFields.find(cf => cf.custom_field_id === itemId)
      : allFields.find(f => f.field_id === itemId);
    if (!field) return;

    const secName = field.section_name || 'Custom Fields';
    
    const secFields = allFields.filter(f => f.template_id === currentTemplateId && f.section_name === secName);
    const secCustom = allCustomFields.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const, id: f.field_id })),
      ...secCustom.map(cf => ({ ...cf, isCustom: true as const, id: cf.custom_field_id }))
    ].sort((a, b) => a.display_order - b.display_order);

    const index = combined.findIndex(item => item.id === itemId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= combined.length) return;

    const tempOrder = combined[index].display_order;
    combined[index].display_order = combined[targetIndex].display_order;
    combined[targetIndex].display_order = tempOrder;

    combined.sort((a, b) => a.display_order - b.display_order);
    
    const updatedCombined = combined.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    setAllFields(prev => prev.map(f => {
      if (f.template_id === currentTemplateId && f.section_name === secName) {
        const match = updatedCombined.find(item => !item.isCustom && item.id === f.field_id);
        if (match) return { ...f, display_order: match.display_order };
      }
      return f;
    }));

    setAllCustomFields(prev => prev.map(cf => {
      if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName) {
        const match = updatedCombined.find(item => item.isCustom && item.id === cf.custom_field_id);
        if (match) return { ...cf, display_order: match.display_order };
      }
      return cf;
    }));
  };


  const handleSaveInlineLabel = () => {
    if (!editingLabelId) return;
    
    // Search default fields
    const fld = activeFields.find(f => f.field_id === editingLabelId);
    if (fld) {
      updateFieldProperty(editingLabelId, { custom_label: editingLabelText });
    } else {
      // Search custom fields
      const cf = activeCustomFields.find(c => c.custom_field_id === editingLabelId);
      if (cf) {
        updateCustomFieldProperty(editingLabelId, { field_name: editingLabelText });
      }
    }
    setEditingLabelId(null);
    setEditingLabelText('');
  };

  // Modals for adding Formula Fields

  const [formulaFieldName, setFormulaFieldName] = useState('');
  const [formulaPlacement, setFormulaPlacement] = useState<'totals' | 'column' | 'custom'>('custom');

  // Formula builder state
  const [formulaTokens, setFormulaTokens] = useState<FormulaToken[]>([]);
  const [formulaAddType, setFormulaAddType] = useState<'field' | 'operator' | 'constant'>('field');
  const [formulaSelectedField, setFormulaSelectedField] = useState(FORMULA_FIELD_OPTIONS[0]?.key || '');
  const [formulaSelectedOp] = useState<'+' | '-' | '*' | '/'>('-');
  const [formulaConstant, setFormulaConstant] = useState('');
  // Crystal Reports Formula Manager extra state
  const [formulaValidationErrors, setFormulaValidationErrors] = useState<string[]>([]);
  const [formulaDescription, setFormulaDescription] = useState('');
  if (formulaAddType && formulaSelectedField && formulaSelectedOp && formulaDescription && false) {
    console.log({ formulaAddType, formulaSelectedField, formulaSelectedOp, formulaDescription });
  }
  const [formulaCategory, setFormulaCategory] = useState<'summary' | 'column'>('summary');
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');

  const resetFormulaModal = () => {
    setFormulaFieldName('');
    setFormulaPlacement('custom');
    setFormulaTokens([]);
    setFormulaConstant('');
    setFormulaAddType('field');
    const firstValid = FORMULA_FIELD_OPTIONS.find(f => f.section === 'Totals' || f.section === 'Summary')?.key || '';
    setFormulaSelectedField(firstValid);
  };

  // ─── Computed Data ──────────────────────────────────────────────────────────
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.template_id === currentTemplateId) || null;
  }, [templates, currentTemplateId]);

  const aspectRatio = useMemo(() => {
    if (!activeTemplate) return 210 / 297;
    const isLandscape = activeTemplate.orientation === 'Landscape';
    const paper = activeTemplate.paper_size || 'A4';
    
    if (paper === 'A4') {
      return isLandscape ? 297 / 210 : 210 / 297;
    }
    if (paper === 'Letter') {
      return isLandscape ? 279 / 216 : 216 / 279;
    }
    if (paper === 'Thermal') {
      return 80 / 180; // Standard thermal preview aspect ratio
    }
    if (paper === 'Custom') {
      const w = parseFloat(activeTemplate.paper_width || '210');
      const h = parseFloat(activeTemplate.paper_height || '297');
      if (w > 0 && h > 0) return w / h;
    }
    return isLandscape ? 297 / 210 : 210 / 297;
  }, [activeTemplate]);

  const targetWidth = activeTemplate?.paper_size === 'Thermal' ? 380 : 794;
  const targetHeight = targetWidth / aspectRatio;

  useEffect(() => {
    if (zoomLevel === '50') {
      setPreviewScale(0.5);
    } else if (zoomLevel === '75') {
      setPreviewScale(0.75);
    } else if (zoomLevel === '100') {
      setPreviewScale(1.0);
    } else if (zoomLevel === '125') {
      setPreviewScale(1.25);
    } else if (zoomLevel === 'fit') {
      const scale = containerWidth > 0 ? (containerWidth / targetWidth) : 1;
      setPreviewScale(scale);
    }
  }, [zoomLevel, containerWidth, targetWidth]);

  const activeSections = useMemo(() => {
    if (!currentTemplateId) return [];
    return allSections
      .filter(s => s.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allSections, currentTemplateId]);

  const activeFields = useMemo(() => {
    if (!currentTemplateId) return [];
    return allFields
      .filter(f => f.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allFields, currentTemplateId]);

  const activeColumns = useMemo(() => {
    if (!currentTemplateId) return [];
    return allColumns
      .filter(c => c.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allColumns, currentTemplateId]);

  const activeCustomFields = useMemo(() => {
    if (!currentTemplateId) return [];
    return allCustomFields
      .filter(c => c.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allCustomFields, currentTemplateId]);

  const selectedField = useMemo(() => {
    if (!selectedFieldId) return null;
    return activeFields.find(f => f.field_id === selectedFieldId) || null;
  }, [activeFields, selectedFieldId]);

  const selectedColumn = useMemo(() => {
    if (!selectedColumnId) return null;
    return activeColumns.find(c => c.column_id === selectedColumnId) || null;
  }, [activeColumns, selectedColumnId]);

  const selectedCustomField = useMemo(() => {
    if (!selectedCustomFieldId) return null;
    return activeCustomFields.find(c => c.custom_field_id === selectedCustomFieldId) || null;
  }, [activeCustomFields, selectedCustomFieldId]);

  // List derived calculations
  const filtered = useMemo(() => {
    return templates
      .filter(t => {
        const q = search.toLowerCase();
        const matchSearch =
          t.template_name.toLowerCase().includes(q) ||
          t.document_type.toLowerCase().includes(q) ||
          t.paper_size.toLowerCase().includes(q);
        const matchDocType = filterDocType === 'all' || t.document_type === filterDocType;
        const matchPaper = filterPaper === 'all' || t.paper_size === filterPaper;
        return matchSearch && matchDocType && matchPaper;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [templates, search, filterDocType, filterPaper, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ─── CRUD Functions ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingTemplate(null);
    setForm({
      template_name: '',
      document_type: 'Sales Invoice',
      paper_size: 'A4',
      orientation: 'Portrait',
      is_default: false,
      is_active: true,
      logo_size: 80,
      qr_enabled: true,
      barcode_enabled: false,
      signature_enabled: true,
      watermark_enabled: false,
      terms_enabled: true,
      remarks_enabled: true
    });
    setFormError('');
    setShowForm(true);
  };

  const openEditBasic = (t: PrintTemplate) => {
    setEditingTemplate(t);
    setForm({
      template_name: t.template_name,
      document_type: t.document_type,
      paper_size: t.paper_size,
      orientation: t.orientation,
      is_default: t.is_default,
      is_active: t.is_active,
      logo_size: t.logo_size || 80,
      qr_enabled: t.qr_enabled,
      barcode_enabled: t.barcode_enabled,
      signature_enabled: t.signature_enabled,
      watermark_enabled: t.watermark_enabled,
      terms_enabled: t.terms_enabled,
      remarks_enabled: t.remarks_enabled,
      logo_url: t.logo_url,
      paper_width: t.paper_width,
      paper_height: t.paper_height
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSaveBasic = () => {
    if (!form.template_name.trim()) {
      setFormError('Template Name is required.');
      return;
    }

    if (editingTemplate) {
      setTemplates(prev =>
        prev.map(t => {
          if (t.template_id === editingTemplate.template_id) {
            return { ...t, ...form };
          }
          if (form.is_default && t.document_type === form.document_type) {
            return { ...t, is_default: false };
          }
          return t;
        })
      );
    } else {
      const newId = `pt-${Date.now()}`;
      const newTemplate: PrintTemplate = {
        template_id: newId,
        ...form
      };

      setTemplates(prev => {
        const updated = form.is_default
          ? prev.map(t => (t.document_type === form.document_type ? { ...t, is_default: false } : t))
          : prev;
        return [...updated, newTemplate];
      });

      // Generate seed sections, fields, columns for the new template
      const newSeedSections = getSeedTemplateSections(newId);
      const newSeedFields = getSeedTemplateFields(newId);
      const newSeedColumns = getSeedTemplateColumns(newId);
      setAllSections(prev => [...prev, ...newSeedSections]);
      setAllFields(prev => [...prev, ...newSeedFields]);
      setAllColumns(prev => [...prev, ...newSeedColumns]);
    }

    setShowForm(false);
  };

  const handleDuplicate = (t: PrintTemplate) => {
    const newId = `pt-${Date.now()}`;
    const duplicated: PrintTemplate = {
      ...t,
      template_id: newId,
      template_name: `${t.template_name} (Copy)`,
      is_default: false
    };

    setTemplates(prev => [...prev, duplicated]);

    // Copy sections
    const sourceSections = allSections.filter(s => s.template_id === t.template_id);
    const newSections = sourceSections.map(s => ({
      ...s,
      section_id: `sec-${newId}-${s.section_id.split('-').pop()}`,
      template_id: newId
    }));
    setAllSections(prev => [...prev, ...newSections]);

    // Copy fields
    const sourceFields = allFields.filter(f => f.template_id === t.template_id);
    const newFields = sourceFields.map((f, i) => ({
      ...f,
      field_id: `fld-${newId}-${i + 1}`,
      template_id: newId
    }));
    setAllFields(prev => [...prev, ...newFields]);

    // Copy columns
    const sourceColumns = allColumns.filter(c => c.template_id === t.template_id);
    const newColumns = sourceColumns.map((c, i) => ({
      ...c,
      column_id: `col-${newId}-${i + 1}`,
      template_id: newId
    }));
    setAllColumns(prev => [...prev, ...newColumns]);

    // Copy custom fields
    const sourceCustom = allCustomFields.filter(c => c.template_id === t.template_id);
    const newCustom = sourceCustom.map((c, i) => ({
      ...c,
      custom_field_id: `cf-${newId}-${i + 1}`,
      template_id: newId
    }));
    setAllCustomFields(prev => [...prev, ...newCustom]);
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    setTemplates(prev => prev.filter(t => t.template_id !== deleteModal.id));
    setAllSections(prev => prev.filter(s => s.template_id !== deleteModal.id));
    setAllFields(prev => prev.filter(f => f.template_id !== deleteModal.id));
    setAllColumns(prev => prev.filter(c => c.template_id !== deleteModal.id));
    setAllCustomFields(prev => prev.filter(c => c.template_id !== deleteModal.id));
    setDeleteModal({ isOpen: false, id: '', name: '' });
    setCurrentPage(1);
  };

  const handleToggleActive = (id: string) => {
    setTemplates(prev =>
      prev.map(t => (t.template_id === id ? { ...t, is_active: !t.is_active } : t))
    );
  };

  const handleSetDefault = (t: PrintTemplate) => {
    setTemplates(prev =>
      prev.map(x => {
        if (x.template_id === t.template_id) return { ...x, is_default: true };
        if (x.document_type === t.document_type) return { ...x, is_default: false };
        return x;
      })
    );
  };

  const handleSort = (key: keyof PrintTemplate) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // ─── Designer Property Mutators ─────────────────────────────────────────────
  const updateFieldProperty = (fieldId: string, props: Partial<PrintTemplateField>) => {
    setAllFields(prev =>
      prev.map(f => (f.field_id === fieldId ? { ...f, ...props } : f))
    );
  };

  const updateSectionProperty = (sectionId: string, props: Partial<PrintTemplateSection>) => {
    setAllSections(prev =>
      prev.map(s => (s.section_id === sectionId ? { ...s, ...props } : s))
    );
  };

  const updateColumnProperty = (colId: string, props: Partial<PrintTemplateColumn>) => {
    setAllColumns(prev =>
      prev.map(c => (c.column_id === colId ? { ...c, ...props } : c))
    );
  };

  const updateCustomFieldProperty = (cfId: string, props: Partial<PrintTemplateCustomField>) => {
    setAllCustomFields(prev =>
      prev.map(cf => (cf.custom_field_id === cfId ? { ...cf, ...props } : cf))
    );
  };

  const updateFieldRowPosition = (itemId: string, type: 'default' | 'custom', newRow: number) => {
    let updatedFields = allFields;
    let updatedCustom = allCustomFields;
    let sectionName = '';

    if (type === 'default') {
      const field = allFields.find(f => f.field_id === itemId);
      if (!field) return;
      sectionName = field.section_name;
      updatedFields = allFields.map(f => f.field_id === itemId ? { ...f, row_position: newRow } : f);
    } else {
      const customField = allCustomFields.find(cf => cf.custom_field_id === itemId);
      if (!customField) return;
      sectionName = customField.section_name || 'Custom Fields';
      updatedCustom = allCustomFields.map(cf => cf.custom_field_id === itemId ? { ...cf, row_position: newRow } : cf);
    }

    const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === sectionName);
    const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const })),
      ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
    ];
    combined.sort((a, b) => {
      const rowA = a.row_position ?? 1;
      const rowB = b.row_position ?? 1;
      if (rowA !== rowB) return rowA - rowB;
      const colA = a.column_position ?? 1;
      const colB = b.column_position ?? 1;
      if (colA !== colB) return colA - colB;
      return a.display_order - b.display_order;
    });

    let currentRow = 0;
    let lastOriginalRow: number | null = null;
    let colIdx = 1;
    const normalized = combined.map((item, index) => {
      const origRow = item.row_position ?? 1;
      if (lastOriginalRow === null || origRow !== lastOriginalRow) {
        currentRow += 1;
        lastOriginalRow = origRow;
        colIdx = 1;
      } else {
        colIdx += 1;
      }
      return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
    });

    setAllFields(prev => prev.map(f => {
      if (f.template_id === currentTemplateId && f.section_name === sectionName) {
        const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
        if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return f;
    }));

    setAllCustomFields(prev => prev.map(cf => {
      if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName) {
        const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
        if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return cf;
    }));
  };

  const updateFieldColumnPosition = (itemId: string, type: 'default' | 'custom', newCol: number) => {
    let updatedFields = allFields;
    let updatedCustom = allCustomFields;
    let sectionName = '';

    if (type === 'default') {
      const field = allFields.find(f => f.field_id === itemId);
      if (!field) return;
      sectionName = field.section_name;
      updatedFields = allFields.map(f => f.field_id === itemId ? { ...f, column_position: newCol } : f);
    } else {
      const customField = allCustomFields.find(cf => cf.custom_field_id === itemId);
      if (!customField) return;
      sectionName = customField.section_name || 'Custom Fields';
      updatedCustom = allCustomFields.map(cf => cf.custom_field_id === itemId ? { ...cf, column_position: newCol } : cf);
    }

    const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === sectionName);
    const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const })),
      ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
    ];
    combined.sort((a, b) => {
      const rowA = a.row_position ?? 1;
      const rowB = b.row_position ?? 1;
      if (rowA !== rowB) return rowA - rowB;
      const colA = a.column_position ?? 1;
      const colB = b.column_position ?? 1;
      if (colA !== colB) return colA - colB;
      return a.display_order - b.display_order;
    });

    let currentRow = 0;
    let lastOriginalRow: number | null = null;
    let colIdx = 1;
    const normalized = combined.map((item, index) => {
      const origRow = item.row_position ?? 1;
      if (lastOriginalRow === null || origRow !== lastOriginalRow) {
        currentRow += 1;
        lastOriginalRow = origRow;
        colIdx = 1;
      } else {
        colIdx += 1;
      }
      return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
    });

    setAllFields(prev => prev.map(f => {
      if (f.template_id === currentTemplateId && f.section_name === sectionName) {
        const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
        if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return f;
    }));

    setAllCustomFields(prev => prev.map(cf => {
      if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName) {
        const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
        if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return cf;
    }));
  };

  const updateTemplateProperty = (props: Partial<PrintTemplate>) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.template_id === currentTemplateId) {
          const nextT = { ...t, ...props };
          return nextT;
        }
        return t;
      })
    );
  };

  const handleResetFilters = () => {
    setFilterDocType('all');
    setFilterPaper('all');
    setTempDocType('all');
    setTempPaper('all');
    setShowFilter(false);
  };

  // ─── Collapsible Sections Map toggler ──────────────────────────────────────


  // ─── Drag and Drop Section Handlers ────────────────────────────────────────

  // ─── Drag and Drop Field Handlers ──────────────────────────────────────────
  const [draggedElement, setDraggedElement] = useState<{ id: string; type: 'default' | 'custom' } | null>(null);





  const executeFieldMove = (
    draggedId: string,
    draggedType: 'default' | 'custom',
    targetId: string,
    targetType: 'default' | 'custom',
    relativePos: 'left' | 'right' | 'top' | 'bottom'
  ) => {
    const sourceElement = draggedType === 'default'
      ? allFields.find(f => f.field_id === draggedId)
      : allCustomFields.find(cf => cf.custom_field_id === draggedId);

    const targetElement = targetType === 'default'
      ? allFields.find(f => f.field_id === targetId)
      : allCustomFields.find(cf => cf.custom_field_id === targetId);

    if (!sourceElement || !targetElement) return;

    const sourceSection = sourceElement.section_name || 'Custom Fields';
    const targetSection = targetElement.section_name || 'Custom Fields';

    if (sourceSection !== targetSection) {
      setDraggedElement(null);
      return;
    }

    let newRow = targetElement.row_position ?? 1;
    let newCol = targetElement.column_position ?? 1;

    if (relativePos === 'left') {
      newCol = newCol - 0.5;
    } else if (relativePos === 'right') {
      newCol = newCol + 0.5;
    } else if (relativePos === 'top') {
      newRow = newRow - 0.5;
      newCol = 1;
    } else if (relativePos === 'bottom') {
      newRow = newRow + 0.5;
      newCol = 1;
    }

    let updatedFields = allFields.map(f => {
      if (f.field_id === draggedId && draggedType === 'default') {
        return { ...f, section_name: targetSection, row_position: newRow, column_position: newCol, is_visible: true };
      }
      return f;
    });

    let updatedCustom = allCustomFields.map(cf => {
      if (cf.custom_field_id === draggedId && draggedType === 'custom') {
        return { ...cf, section_name: targetSection, row_position: newRow, column_position: newCol, is_visible: true };
      }
      return cf;
    });

    const normalizeSectionInPlace = (secName: string) => {
      const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === secName);
      const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName);
      const combined = [
        ...secFields.map(f => ({ ...f, isCustom: false as const })),
        ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
      ];
      combined.sort((a, b) => {
        const rowA = a.row_position ?? 1;
        const rowB = b.row_position ?? 1;
        if (rowA !== rowB) return rowA - rowB;
        const colA = a.column_position ?? 1;
        const colB = b.column_position ?? 1;
        if (colA !== colB) return colA - colB;
        return a.display_order - b.display_order;
      });
      let currentRow = 0;
      let lastOriginalRow: number | null = null;
      let colIdx = 1;
      const normalized = combined.map((item, index) => {
        const origRow = item.row_position ?? 1;
        if (lastOriginalRow === null || origRow !== lastOriginalRow) {
          currentRow += 1;
          lastOriginalRow = origRow;
          colIdx = 1;
        } else {
          colIdx += 1;
        }
        return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
      });
      updatedFields = updatedFields.map(f => {
        if (f.template_id === currentTemplateId && f.section_name === secName) {
          const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
          if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return f;
      });
      updatedCustom = updatedCustom.map(cf => {
        if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName) {
          const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
          if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return cf;
      });
    };

    normalizeSectionInPlace(sourceSection);
    if (sourceSection !== targetSection) {
      normalizeSectionInPlace(targetSection);
    }

    setAllFields(updatedFields);
    setAllCustomFields(updatedCustom);
    setDraggedElement(null);
  };

  const handleDropFieldOnField = (e: React.DragEvent, targetId: string, targetType: 'default' | 'custom') => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedElement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;

    let relativePos: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
    if (x < w * 0.35) {
      relativePos = 'left';
    } else if (x > w * 0.65) {
      relativePos = 'right';
    } else {
      relativePos = y < h * 0.5 ? 'top' : 'bottom';
    }

    executeFieldMove(draggedElement.id, draggedElement.type, targetId, targetType, relativePos);
  };

  const handleSectionDropField = (targetSection: string) => {
    if (!draggedElement) return;
    const { id: draggedId, type: draggedType } = draggedElement;

    const sourceElement = draggedType === 'default'
      ? allFields.find(f => f.field_id === draggedId)
      : allCustomFields.find(cf => cf.custom_field_id === draggedId);
    if (!sourceElement) return;

    const sourceSection = sourceElement.section_name || 'Custom Fields';
    if (sourceSection !== targetSection) {
      setDraggedElement(null);
      return;
    }

    const targetFields = allFields.filter(f => f.template_id === currentTemplateId && f.section_name === targetSection);
    const targetCustom = allCustomFields.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === targetSection);
    const maxRow = Math.max(
      0,
      ...targetFields.map(f => f.row_position ?? 1),
      ...targetCustom.map(cf => cf.row_position ?? 1)
    );

    let updatedFields = allFields.map(f => {
      if (f.field_id === draggedId && draggedType === 'default') {
        return { ...f, section_name: targetSection, row_position: maxRow + 1, column_position: 1 };
      }
      return f;
    });

    let updatedCustom = allCustomFields.map(cf => {
      if (cf.custom_field_id === draggedId && draggedType === 'custom') {
        return { ...cf, section_name: targetSection, row_position: maxRow + 1, column_position: 1 };
      }
      return cf;
    });

    const normalizeSectionInPlace = (secName: string) => {
      const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === secName);
      const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName);
      const combined = [
        ...secFields.map(f => ({ ...f, isCustom: false as const })),
        ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
      ];
      combined.sort((a, b) => {
        const rowA = a.row_position ?? 1;
        const rowB = b.row_position ?? 1;
        if (rowA !== rowB) return rowA - rowB;
        const colA = a.column_position ?? 1;
        const colB = b.column_position ?? 1;
        if (colA !== colB) return colA - colB;
        return a.display_order - b.display_order;
      });
      let currentRow = 0;
      let lastOriginalRow: number | null = null;
      let colIdx = 1;
      const normalized = combined.map((item, index) => {
        const origRow = item.row_position ?? 1;
        if (lastOriginalRow === null || origRow !== lastOriginalRow) {
          currentRow += 1;
          lastOriginalRow = origRow;
          colIdx = 1;
        } else {
          colIdx += 1;
        }
        return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
      });
      updatedFields = updatedFields.map(f => {
        if (f.template_id === currentTemplateId && f.section_name === secName) {
          const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
          if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return f;
      });
      updatedCustom = updatedCustom.map(cf => {
        if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName) {
          const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
          if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return cf;
      });
    };

    normalizeSectionInPlace(sourceSection);
    normalizeSectionInPlace(targetSection);

    setAllFields(updatedFields);
    setAllCustomFields(updatedCustom);
    setDraggedElement(null);
  };

  // ─── Drag and Drop Column Handlers ─────────────────────────────────────────
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const handleColumnDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
    setDraggedColumnId(colId);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleColumnDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain') || draggedColumnId;
    if (!draggedId || draggedId === targetColId) return;

    const sourceIdx = activeColumns.findIndex(c => c.column_id === draggedId);
    const targetIdx = activeColumns.findIndex(c => c.column_id === targetColId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reordered = [...activeColumns];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((col, idx) => ({
      ...col,
      display_order: idx + 1
    }));

    setAllColumns(prev =>
      prev.map(c => {
        if (c.template_id === currentTemplateId) {
          const match = updated.find(u => u.column_id === c.column_id);
          return match ? match : c;
        }
        return c;
      })
    );
    setDraggedColumnId(null);
  };

  // ─── Drag and Drop Section Handlers ────────────────────────────────────────
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const handleSectionDragStart = (secId: string) => {
    setDraggedSectionId(secId);
  };

  const handleSectionDrop = (targetSecId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSecId) return;

    const sourceIdx = activeSections.findIndex(s => s.section_id === draggedSectionId);
    const targetIdx = activeSections.findIndex(s => s.section_id === targetSecId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reordered = [...activeSections];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((sec, idx) => ({
      ...sec,
      display_order: idx + 1
    }));

    setAllSections(prev =>
      prev.map(s => {
        if (s.template_id === currentTemplateId) {
          const match = updated.find(u => u.section_id === s.section_id);
          return match ? match : s;
        }
        return s;
      })
    );
    setDraggedSectionId(null);
  };

  // ─── Formula Field Builder ──────────────────────────────────────────────────
  const handleSaveFormula = () => {
    if (!formulaFieldName.trim()) return;
    if (formulaTokens.length === 0) return;

    let savedId = editingFormulaId;

    if (editingFormulaId) {
      if (editingFormulaId.startsWith('col-formula-')) {
        setAllColumns(prev => prev.map(c => {
          if (c.column_id === editingFormulaId) {
            return {
              ...c,
              column_name: formulaFieldName,
              formula_tokens: formulaTokens
            };
          }
          return c;
        }));
      } else {
        setAllCustomFields(prev => prev.map(cf => {
          if (cf.custom_field_id === editingFormulaId) {
            return {
              ...cf,
              field_name: formulaFieldName,
              formula_tokens: formulaTokens
            };
          }
          return cf;
        }));
      }
    } else {
      if (formulaPlacement === 'column') {
        const newId = `col-formula-${currentTemplateId}-${Date.now()}`;
        savedId = newId;
        const newCol: PrintTemplateColumn = {
          column_id: newId,
          template_id: currentTemplateId || '',
          column_name: formulaFieldName,
          display_order: activeColumns.length + 1,
          is_visible: true,
          width: '12%',
          is_custom: true,
          formula_tokens: formulaTokens
        };
        setAllColumns(prev => [...prev, newCol]);
      } else {
        const newId = `cf-formula-${currentTemplateId}-${Date.now()}`;
        savedId = newId;
        const newField: PrintTemplateCustomField = {
          custom_field_id: newId,
          template_id: currentTemplateId || '',
          field_name: formulaFieldName,
          field_type: 'formula',
          default_value: '',
          display_order: activeCustomFields.length + 1,
          is_visible: true,
          section_name: formulaPlacement === 'totals' ? 'Totals' : 'Custom Fields',
          row_position: 10,
          column_position: 1,
          formula_tokens: formulaTokens
        };
        setAllCustomFields(prev => [...prev, newField]);
      }
    }

    setEditingFormulaId(savedId);
    setFormulaAddType('field');
  };

  const handleRemoveCustomField = (cfId: string) => {
    setAllCustomFields(prev => prev.filter(c => c.custom_field_id !== cfId));
  };

  // ─── Custom Column Builder ──────────────────────────────────────────────────

  const handleRemoveCustomColumn = (colId: string) => {
    setAllColumns(prev => prev.filter(c => c.column_id !== colId));
  };

  // ─── Logo upload handler ────────────────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateTemplateProperty({ logo_url: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Import / Export Configurations ──────────────────────────────────────────
  const handleExportTemplate = (t: PrintTemplate) => {
    const config = {
      template: t,
      sections: allSections.filter(s => s.template_id === t.template_id),
      fields: allFields.filter(f => f.template_id === t.template_id),
      columns: allColumns.filter(c => c.template_id === t.template_id),
      customFields: allCustomFields.filter(cf => cf.template_id === t.template_id)
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t.template_name.replace(/\s+/g, '_')}_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string);
          if (config.template && config.sections && config.fields) {
            const importedTemplateId = `pt-${Date.now()}`;
            const importedTemplate: PrintTemplate = {
              ...config.template,
              template_id: importedTemplateId,
              template_name: `${config.template.template_name} (Imported)`,
              is_default: false
            };

            setTemplates(prev => [...prev, importedTemplate]);

            // Add sections
            const importedSections = config.sections.map((s: any) => ({
              ...s,
              section_id: `sec-${importedTemplateId}-${s.section_id.split('-').pop()}`,
              template_id: importedTemplateId
            }));
            setAllSections(prev => [...prev, ...importedSections]);

            // Add fields
            const importedFields = config.fields.map((f: any, i: number) => ({
              ...f,
              field_id: `fld-${importedTemplateId}-${i + 1}`,
              template_id: importedTemplateId
            }));
            setAllFields(prev => [...prev, ...importedFields]);

            // Add columns
            if (config.columns) {
              const importedColumns = config.columns.map((c: any, i: number) => ({
                ...c,
                column_id: `col-${importedTemplateId}-${i + 1}`,
                template_id: importedTemplateId
              }));
              setAllColumns(prev => [...prev, ...importedColumns]);
            }

            // Add custom fields
            if (config.customFields) {
              const importedCustom = config.customFields.map((c: any, i: number) => ({
                ...c,
                custom_field_id: `cf-${importedTemplateId}-${i + 1}`,
                template_id: importedTemplateId
              }));
              setAllCustomFields(prev => [...prev, ...importedCustom]);
            }

            setAlertModal({
              isOpen: true,
              title: 'Template Imported',
              message: 'Template imported successfully!',
              variant: 'info'
            });
          }
        } catch {
          setAlertModal({
            isOpen: true,
            title: 'Import Failed',
            message: 'Failed to parse template JSON file!',
            variant: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const getSampleValue = (fieldName: string) => {
    switch (fieldName) {
      case 'Company Name': return 'Antigravity Creative Studio';
      case 'Company Address': return '452 Innovation Blvd, San Francisco, CA 94107';
      case 'Phone': return '+1 (555) 012-3456';
      case 'Email': return 'contact@antigravity.studio';
      case 'Website': return 'www.antigravity.studio';
      case 'NTN': return '1234567-8';
      case 'STRN': case 'STN': case 'STN / STRN': return '03-00-1234-567-89';
      case 'Customer Name': return 'BlueRitt Technologies Inc.';
      case 'Customer Address': return 'House 42, Street 5, Karachi, PK';
      case 'Mobile': return '0300-1234567';
      case 'Customer NTN': return '9876543-2';
      case 'Customer Email': return 'billing@blueritt.com';
      case 'Customer CNIC': return '42201-1234567-1';
      case 'Invoice Number': return 'SI-000248';
      case 'Date': case 'Invoice Date': return '2026-06-11';
      case 'Due Date': return '2026-07-11';
      case 'Sales Person': return 'Ahmed Raza';
      case 'Reference Number': return 'REF-992';
      case 'Warehouse': return 'Lahore Central';
      case 'Payment Terms': return 'Net 30';
      case 'Remarks': return 'Please process this invoice under standard business conditions.';
      case 'Terms & Conditions': return 'Payment is due within 30 days of issue. Balance subject to 2% late penalty.';
      case 'Notes': return 'Goods once sold are non-refundable. Tax paid has been deposited with FBR.';
      case 'Prepared By': return 'Aman Khan';
      case 'Received By': return 'Manager';
      case 'Customer STRN': return '03-09-9999-001-22';
      case 'Customer Code': return 'CUST-9928';
      case 'FBR Invoice Number': return 'FBR-INV-1092837';
      case 'Company Stamp': return '[Antigravity Studio Seal]';
      case 'FBR Logo': return '[FBR Logo]';
      case 'Subtotal': case 'Grand Total': case 'Balance Due': return '8,450.00';
      default: return '0.00';
    }
  };

  const renderFieldContent = (item: any, _sectionName: string) => {
    if (!activeTemplate) return null;
    const isEditingLabel = editingLabelId === (item.isCustom ? item.custom_field_id : item.field_id);
    const itemId = item.isCustom ? item.custom_field_id : item.field_id;

    if (isEditingLabel) {
      return (
        <input
          type="text"
          value={editingLabelText}
          onChange={e => setEditingLabelText(e.target.value)}
          onBlur={handleSaveInlineLabel}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSaveInlineLabel();
          }}
          className="w-full text-[9px] border p-0.5 rounded outline-none"
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      );
    }

    if (item.field_name === 'Company Logo') {
      return activeTemplate.logo_url ? (
        <img
          src={activeTemplate.logo_url}
          alt="Logo"
          style={{
            height: `${activeTemplate.logo_size || 80}px`,
            objectFit: 'contain'
          }}
        />
      ) : (
        <div className="border border-dashed rounded flex items-center justify-center bg-slate-50 text-[8px] text-slate-400 p-2.5 w-32 h-12">
          Upload Logo
        </div>
      );
    }

    if (item.field_name === 'Item Table') {
      const visibleCols = activeColumns.filter(c => c.is_visible);
      return (
        <div className="overflow-hidden bg-white w-full text-[8px]">
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-[7px] font-bold text-slate-500">
                {visibleCols.map(col => (
                  <th
                    key={col.column_id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleColumnDragStart(e, col.column_id);
                    }}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleColumnDrop(e, col.column_id);
                    }}
                    className="py-1 px-1.5 font-black text-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors border border-slate-300"
                    style={{ width: col.width, textAlign: col.alignment || 'left' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColumnId(col.column_id);
                      setSelectedFieldId(null);
                      setSelectedCustomFieldId(null);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedColumnId(col.column_id);
                      setSelectedFieldId(null);
                      setSelectedCustomFieldId(null);
                      setShowColumnPropertiesModal(true);
                    }}
                  >
                    {col.custom_label || col.column_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-300 text-slate-650 text-[7px]">
                {visibleCols.map(col => {
                  let val = '-';
                  if (col.column_name === 'Sr No') val = '1';
                  else if (col.column_name === 'Product Code') val = 'BC-001';
                  else if (col.column_name === 'Product Name') val = 'Sample Product';
                  else if (col.column_name === 'Description') val = 'Deliverables';
                  else if (col.column_name === 'Quantity' || col.column_name === 'Qty') val = '1.00';
                  else if (col.column_name === 'Rate' || col.column_name === 'Unit Price') val = '8,450.00';
                  else if (col.column_name === 'Discount') val = '0.00';
                  else if (col.column_name === 'Tax') val = '1,352.00';
                  else if (col.column_name === 'Amount') val = '9,802.00';
                  else if (col.is_custom && col.formula_tokens && col.formula_tokens.length > 0) {
                    // Evaluate formula using dummy row context
                    try {
                      const fieldMap: Record<string, number> = {
                        'quantity': dummyContext.row.quantity,
                        'price': dummyContext.row.price,
                        'rate': dummyContext.row.price,
                        'line_total': dummyContext.row.quantity * dummyContext.row.price,
                        'discount': dummyContext.row.discount,
                        'tax': dummyContext.row.tax,
                        'further_tax': dummyContext.row.furtherTax,
                        'subtotal': dummyContext.totals.subtotal,
                        'tax_amount': dummyContext.totals.tax_amount,
                        'discount_amount': dummyContext.totals.discount_amount,
                        'shipping_charges': dummyContext.totals.shipping_charges,
                        'other_charges': dummyContext.totals.other_charges,
                        'round_off': dummyContext.totals.round_off,
                        'grand_total': dummyContext.totals.grand_total,
                        'paid_amount': dummyContext.totals.paid_amount,
                        'balance_due': dummyContext.totals.balance_due,
                        'total_qty': dummyContext.totals.total_qty,
                        'total_items': dummyContext.totals.total_items
                      };
                      let result = 0;
                      let pendingOp = '+';
                      for (const tok of col.formula_tokens) {
                        let num = 0;
                        if (tok.type === 'field') num = fieldMap[tok.fieldKey as string] ?? 0;
                        else if (tok.type === 'constant') num = parseFloat(String(tok.constant ?? '0')) || 0;
                        else if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
                        if (pendingOp === '+') result += num;
                        else if (pendingOp === '-') result -= num;
                        else if (pendingOp === '*') result *= num;
                        else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
                        else if (pendingOp === '%') result = result * num / 100;
                      }
                      val = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    } catch { val = '0.00'; }
                  }
                  return (
                    <td key={col.column_id} className="py-1 px-1.5" style={{ textAlign: col.alignment || 'left' }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (item.field_name === 'QR Code') {
      return activeTemplate.qr_enabled ? (
        <div className="w-10 h-10 border p-0.5 rounded bg-white flex items-center justify-center">
          <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-2 2h2v2-2v-2zm2 2h3v3h-3v-3zm-2 2h2v2-2v-2zm4-4h2v4h-2v-4zm0 6h2v1h-2v-1z" />
          </svg>
        </div>
      ) : null;
    }

    if (item.field_name === 'Barcode') {
      return activeTemplate.barcode_enabled ? (
        <div className="w-32 py-1">
          <svg className="h-6 w-full text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
            <rect width="100" height="20" fill="white"/>
            <rect x="5" y="2" width="2" height="16" fill="currentColor"/>
            <rect x="10" y="2" width="4" height="16" fill="currentColor"/>
            <rect x="16" y="2" width="1" height="16" fill="currentColor"/>
            <rect x="20" y="2" width="3" height="16" fill="currentColor"/>
            <rect x="25" y="2" width="5" height="16" fill="currentColor"/>
            <rect x="32" y="2" width="2" height="16" fill="currentColor"/>
            <rect x="36" y="2" width="1" height="16" fill="currentColor"/>
            <rect x="40" y="2" width="4" height="16" fill="currentColor"/>
            <rect x="48" y="2" width="2" height="16" fill="currentColor"/>
            <rect x="52" y="2" width="3" height="16" fill="currentColor"/>
            <rect x="58" y="2" width="5" height="16" fill="currentColor"/>
          </svg>
        </div>
      ) : null;
    }

    if (item.field_name === 'Signature') {
      return activeTemplate.signature_enabled ? (
        <div className="w-32 text-center" onDoubleClick={e => handleDoubleClick(e, itemId, item.custom_label || 'Seller Signature')}>
          <div className="border-b border-slate-355 w-full h-3" />
          <span className="text-[7.5px] text-slate-400 block mt-0.5 cursor-pointer hover:bg-slate-50 rounded px-1">
            {item.custom_label || 'Seller Signature'}
          </span>
        </div>
      ) : null;
    }

    if (item.field_name === 'FBR Logo') {
      return (
        <div className="flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          <div className="flex flex-col text-left leading-[1.1]">
            <span>FBR</span>
            <span className="text-[5px] text-emerald-500 font-medium font-sans">Pakistan</span>
          </div>
        </div>
      );
    }

    if (item.field_name === 'Company Stamp') {
      return (
        <div className="w-20 h-10 border border-dashed border-slate-350 rounded-full flex flex-col items-center justify-center opacity-65 select-none bg-slate-50/50">
          <span className="text-[5px] font-bold text-slate-455">Company Stamp</span>
          <span className="text-[4px] text-slate-350">Seal Here</span>
        </div>
      );
    }

    if (item.field_name === 'Watermark') {
      return null;
    }

    const label = item.isCustom ? item.field_name : (item.custom_label || item.field_name);
    const sampleVal = getSampleValue(item.field_name);

    if (item.field_name === 'Remarks' && !activeTemplate.remarks_enabled) return null;
    if (item.field_name === 'Terms & Conditions' && !activeTemplate.terms_enabled) return null;

    const labelColor = item.label_color || item.color;
    const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
    const valueColor = item.value_color || item.color;
    const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

    if (['Prepared By', 'Received By'].includes(item.field_name)) {
      return (
        <div className="inline-block text-center mr-4" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
          <div className="border-b border-slate-300 w-24 h-4" />
          <span className="text-[8px] text-slate-450" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{label}</span>
        </div>
      );
    }

    if (['Subtotal', 'Grand Total', 'Balance Due', 'Tax Amount', 'Discount Amount', 'Shipping Charges', 'Round Off', 'Received Amount'].includes(item.field_name)) {
      return (
        <div className="grid grid-cols-12 w-full items-center gap-x-2" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
          <div className="col-span-7 text-left">
            <span className="text-slate-400 font-bold" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}:</span>
          </div>
          <div className="col-span-2 text-center text-slate-400 font-bold" style={{ color: labelColor || undefined }}>
            Rs.
          </div>
          <div className="col-span-3 text-right">
            <span className="font-extrabold" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>
              {item.field_name === 'Balance Due' || item.field_name === 'Grand Total' || item.field_name === 'Subtotal' ? '8,450.00' : '0.00'}
            </span>
          </div>
        </div>
      );
    }

    // For formula custom fields, evaluate and show a sample result
    if (item.isCustom && item.field_type === 'formula' && item.formula_tokens && item.formula_tokens.length > 0) {
      let formulaSample = '0.00';
      try {
        const fieldMap: Record<string, number> = {
          'quantity': dummyContext.row.quantity,
          'price': dummyContext.row.price,
          'rate': dummyContext.row.price,
          'line_total': dummyContext.row.quantity * dummyContext.row.price,
          'discount': dummyContext.row.discount,
          'tax': dummyContext.row.tax,
          'subtotal': dummyContext.totals.subtotal,
          'tax_amount': dummyContext.totals.tax_amount,
          'discount_amount': dummyContext.totals.discount_amount,
          'shipping_charges': dummyContext.totals.shipping_charges,
          'other_charges': dummyContext.totals.other_charges,
          'round_off': dummyContext.totals.round_off,
          'grand_total': dummyContext.totals.grand_total,
          'paid_amount': dummyContext.totals.paid_amount,
          'balance_due': dummyContext.totals.balance_due,
          'total_qty': dummyContext.totals.total_qty,
          'total_items': dummyContext.totals.total_items
        };
        let result = 0;
        let pendingOp = '+';
        for (const tok of item.formula_tokens) {
          let num = 0;
          if (tok.type === 'field') num = fieldMap[tok.fieldKey] ?? 0;
          else if (tok.type === 'constant') num = parseFloat(tok.constant ?? '0') || 0;
          else if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
          if (pendingOp === '+') result += num;
          else if (pendingOp === '-') result -= num;
          else if (pendingOp === '*') result *= num;
          else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
          else if (pendingOp === '%') result = result * num / 100;
        }
        formulaSample = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } catch { formulaSample = '0.00'; }

      return (
        <div className="grid grid-cols-12 w-full items-center gap-x-2" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
          <div className="col-span-7 text-left">
            <span className="text-slate-400 font-bold" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}:</span>
          </div>
          <div className="col-span-2 text-center text-slate-400 font-bold" style={{ color: labelColor || undefined }}>Rs.</div>
          <div className="col-span-3 text-right">
            <span className="font-extrabold" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{formulaSample}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center flex-wrap" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
        <strong className="text-slate-400 mr-1" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}: </strong>
        <span className="text-slate-700" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{item.isCustom ? (item.default_value || 'Sample') : sampleVal}</span>
      </div>
    );
  };

  const renderSectionFields = (sectionName: string) => {
    const secFields = activeFields.filter(f => f.section_name === sectionName);
    const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === sectionName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const })),
      ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
    ];

    if (combined.length === 0) {
      return <div className="text-[9px] text-slate-400 p-2 italic border border-dashed rounded text-center w-full">Empty Section. Drag fields here.</div>;
    }

    const rowsMap: Record<number, typeof combined> = {};
    combined.forEach(item => {
      const r = item.row_position ?? 1;
      if (!rowsMap[r]) rowsMap[r] = [];
      rowsMap[r].push(item);
    });

    const sortedRowKeys = Object.keys(rowsMap).map(Number).sort((a, b) => a - b);

    return (
      <div className="w-full space-y-2">
        {sortedRowKeys.map(rowNum => {
          const rowItems = rowsMap[rowNum].sort((a, b) => {
            const colA = a.column_position ?? 1;
            const colB = b.column_position ?? 1;
            if (colA !== colB) return colA - colB;
            return a.display_order - b.display_order;
          });

          return (
            <div key={rowNum} className="grid grid-cols-12 gap-x-4 gap-y-2 w-full items-start">
              {rowItems.map(item => {
                const isSelected = item.isCustom ? selectedCustomFieldId === item.custom_field_id : selectedFieldId === item.field_id;
                const itemId = item.isCustom ? item.custom_field_id : item.field_id;
                
                let defaultWidth = 100;
                if (sectionName === 'Customer Information') defaultWidth = 50;
                else if (sectionName === 'Invoice Information') defaultWidth = 33;
                else if (sectionName === 'Totals') defaultWidth = 100;

                const widthPercent = sectionName === 'Totals' ? 100 : (item.width_percent || defaultWidth);
                const isFullBlock = ['Company Logo', 'Item Table', 'Remarks', 'Terms & Conditions', 'FBR Logo', 'Notes'].includes(item.field_name);
                
                let colSpan = 'col-span-12';
                if (!isFullBlock) {
                  if (widthPercent <= 25) colSpan = 'col-span-3';
                  else if (widthPercent <= 33) colSpan = 'col-span-4';
                  else if (widthPercent <= 50) colSpan = 'col-span-6';
                  else colSpan = 'col-span-12';
                }

                const fieldElement = renderFieldContent(item, sectionName);
                if (!fieldElement) return null;

                return (
                  <div
                    key={itemId}
                    className={colSpan}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggedElement({ id: itemId, type: item.isCustom ? 'custom' : 'default' });
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const w = rect.width;
                      const h = rect.height;
                      let pos: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
                      if (x < w * 0.35) pos = 'left';
                      else if (x > w * 0.65) pos = 'right';
                      else pos = y < h * 0.5 ? 'top' : 'bottom';
                      
                      if (!dragOverField || dragOverField.id !== itemId || dragOverField.pos !== pos) {
                        setDragOverField({ id: itemId, pos });
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverField(null);
                    }}
                    onDrop={(e) => {
                      setDragOverField(null);
                      handleDropFieldOnField(e, itemId, item.isCustom ? 'custom' : 'default');
                    }}
                    style={{
                      paddingLeft: '2px',
                      paddingRight: '2px',
                      marginLeft: (item.column_position === 3 || item.field_name === 'Signature') ? 'auto' : undefined
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: item.alignment === 'center' ? 'center' : item.alignment === 'right' ? 'flex-end' : 'flex-start',
                        fontSize: item.font_size ? `${item.font_size}px` : undefined,
                        textAlign: item.alignment || (sectionName === 'Totals' ? 'right' : 'left'),
                        fontWeight: item.is_bold ? 'bold' : 'normal',
                        color: item.color,
                        cursor: 'move',
                        backgroundColor: isSelected ? `${brand.primary}10` : (item.background || 'transparent'),
                        borderLeft: dragOverField?.id === itemId && dragOverField.pos === 'left' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        borderRight: dragOverField?.id === itemId && dragOverField.pos === 'right' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        borderTop: dragOverField?.id === itemId && dragOverField.pos === 'top' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        borderBottom: dragOverField?.id === itemId && dragOverField.pos === 'bottom' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' ? '1px solid #cbd5e1' : item.border === 'bottom-slate' ? '1px solid #475569' : item.border === 'bottom-black' ? '1px solid #000000' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        padding: item.padding || '4px',
                        marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                        outline: isSelected ? `1px dashed ${brand.primary}` : undefined,
                        opacity: item.is_visible ? 1 : 0.45,
                      }}
                      className="transition-all hover:bg-slate-50 p-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.isCustom) {
                          setSelectedCustomFieldId(itemId);
                          setSelectedFieldId(null);
                          setSelectedColumnId(null);
                        } else {
                          setSelectedFieldId(itemId);
                          setSelectedCustomFieldId(null);
                          setSelectedColumnId(null);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (item.isCustom) {
                          setSelectedCustomFieldId(itemId);
                          setSelectedFieldId(null);
                          setSelectedColumnId(null);
                        } else {
                          setSelectedFieldId(itemId);
                          setSelectedCustomFieldId(null);
                          setSelectedColumnId(null);
                        }
                        setShowFieldPropertiesModal(true);
                      }}
                    >
                      {fieldElement}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (view === 'designer' && activeTemplate) {
    
    return (
      <div className="space-y-4">
        {/* Designer Header bar */}
        <div className="flex flex-col gap-3 pb-3 border-b border-[#E2E8F0]">
          {/* Row 1: Back, Title, and Save Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('list')}
                className="p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm font-black text-slate-800">
                  Template Designer — {activeTemplate.template_name}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeTemplate.document_type} · {activeTemplate.paper_size} · {activeTemplate.orientation}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="white"
                size="sm"
                icon={Undo}
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
              >
                Undo
              </Button>
              <Button
                variant="white"
                size="sm"
                icon={Redo}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
              >
                Redo
              </Button>
              <Button
                variant="white"
                size="sm"
                icon={Download}
                onClick={() => handleExportTemplate(activeTemplate)}
              >
                Export
              </Button>
              <Button
                variant="white"
                size="sm"
                icon={Copy}
                onClick={() => handleDuplicate(activeTemplate)}
              >
                Duplicate
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Check}
                onClick={() => {
                  if (activeTemplate) {
                    saveSingleTemplateLayout(activeTemplate, allSections, allFields, allColumns, allCustomFields);
                  }
                  setView('list');
                }}
                style={{ backgroundColor: brand.primary }}
              >
                Save layout
              </Button>
            </div>
          </div>

          {/* Row 2: Manager Buttons and Zoom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="white"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => {
                  setExpandedSectionId('company');
                  setShowLayoutModal(true);
                }}
              >
                Layout Settings
              </Button>
              <Button
                variant="white"
                size="sm"
                icon={FileText}
                onClick={() => {
                  const firstField = activeCustomFields.find(cf => cf.field_type === 'formula');
                  const firstCol = activeColumns.find(c => c.is_custom && c.formula_tokens && c.formula_tokens.length > 0);
                  if (firstField) {
                    setEditingFormulaId(firstField.custom_field_id);
                    setFormulaFieldName(firstField.field_name);
                    setFormulaPlacement(firstField.section_name === 'Custom Fields' ? 'custom' : 'totals');
                    setFormulaTokens(firstField.formula_tokens || []);
                  } else if (firstCol) {
                    setEditingFormulaId(firstCol.column_id);
                    setFormulaFieldName(firstCol.column_name);
                    setFormulaPlacement('column');
                    setFormulaTokens(firstCol.formula_tokens || []);
                  } else {
                    setEditingFormulaId(null);
                    resetFormulaModal();
                  }
                  setShowFormulasModal(true);
                }}
              >
                Formulas
              </Button>
              <Button
                variant="white"
                size="sm"
                icon={Settings}
                onClick={() => setShowTemplateSettingsModal(true)}
              >
                Template Settings
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold text-slate-400">Zoom:</span>
              <select
                value={zoomLevel}
                onChange={e => setZoomLevel(e.target.value as any)}
                className="text-[10px] font-bold text-slate-650 bg-white border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
              >
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
                <option value="125">125%</option>
                <option value="fit">Fit Width</option>
              </select>
            </div>
          </div>
        </div>

        {/* Designer Workspace - Centered Preview Canvas */}
        <div className="w-full flex justify-center py-2">
          {/* 2. Center Panel: Live print-like Preview Canvas */}
          <div className="w-[85%] mx-auto h-[750px] border border-[#E2E8F0] bg-slate-100 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 border-b pb-1 select-none">
              <span>Live Print Preview</span>
              <span>100% Visual Consistency</span>
            </div>
            {/* Conditional Layout Engine */}
            {activeTemplate.layout_mode === 'free' ? (
              <div
                ref={containerRefCallback}
                className="flex-grow bg-slate-100 overflow-y-auto overflow-x-hidden relative p-4 flex flex-col items-center custom-scrollbar rounded-lg"
              >
                <div
                  ref={canvasRef}
                  className="bg-white shadow-lg border border-slate-350 relative transition-all"
                  style={{
                    width: `${targetWidth}px`,
                    height: `${targetHeight}px`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(previewScale - 1) * targetHeight}px`,
                    flexShrink: 0,
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggedElement || !canvasRef.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    const dropX = Math.round(Math.max(0, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100)));
                    const dropY = Math.round(Math.max(0, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100)));
                    if (draggedElement.type === 'default') {
                      updateFieldProperty(draggedElement.id, { is_visible: true, position_x: dropX, position_y: dropY });
                    } else {
                      updateCustomFieldProperty(draggedElement.id, { is_visible: true, position_x: dropX, position_y: dropY });
                    }
                    setDraggedElement(null);
                  }}
                >
                    {activeFields
                      .filter(f => f.is_visible)
                      .map(f => {
                        const isSelected = selectedFieldId === f.field_id;
                        const isEditingLabel = editingLabelId === f.field_id;
                        
                        let elementContent = null;
                        
                        if (f.field_name === 'Company Logo') {
                          elementContent = activeTemplate.logo_url ? (
                            <img
                              src={activeTemplate.logo_url}
                              alt="Logo"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full border border-dashed rounded flex items-center justify-center bg-slate-50 text-[8px] text-slate-400">
                              Upload Logo
                            </div>
                          );
                        } else if (f.field_name === 'Item Table') {
                          const visibleCols = activeColumns.filter(c => c.is_visible);
                          elementContent = (
                            <div className="border rounded bg-white overflow-hidden w-full h-full text-[8px] flex flex-col justify-between">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b text-[7px] font-bold text-slate-500">
                                    {visibleCols.map(col => (
                                      <th
                                        key={col.column_id}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          handleColumnDragStart(e, col.column_id);
                                        }}
                                        onDragOver={handleColumnDragOver}
                                        onDrop={(e) => {
                                          e.stopPropagation();
                                          handleColumnDrop(e, col.column_id);
                                        }}
                                        className="py-1 px-1.5 font-black text-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors"
                                        style={{ width: col.width, textAlign: col.alignment || 'left' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedColumnId(col.column_id);
                                          setSelectedFieldId(null);
                                          setSelectedCustomFieldId(null);
                                        }}
                                        onDoubleClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedColumnId(col.column_id);
                                          setSelectedFieldId(null);
                                          setSelectedCustomFieldId(null);
                                          setShowColumnPropertiesModal(true);
                                        }}
                                      >
                                        {col.custom_label || col.column_name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b text-slate-600 text-[7px]">
                                    {visibleCols.map(col => {
                                      let val = '-';
                                      if (col.column_name === 'Sr No') val = '1';
                                      else if (col.column_name === 'Product Code') val = 'BC-001';
                                      else if (col.column_name === 'Product Name') val = 'Sample Product';
                                      else if (col.column_name === 'Description') val = 'Deliverables';
                                      else if (col.column_name === 'Quantity' || col.column_name === 'Qty') val = '1.00';
                                      else if (col.column_name === 'Rate' || col.column_name === 'Unit Price') val = '8,450.00';
                                      else if (col.column_name === 'Discount') val = '0.00';
                                      else if (col.column_name === 'Tax') val = '1,352.00';
                                      else if (col.column_name === 'Amount') val = '9,802.00';
                                      else if (col.is_custom && col.formula_tokens && col.formula_tokens.length > 0) {
                                        try {
                                          const fieldMap: Record<string, number> = {
                                            'quantity': dummyContext.row.quantity,
                                            'price': dummyContext.row.price,
                                            'rate': dummyContext.row.price,
                                            'line_total': dummyContext.row.quantity * dummyContext.row.price,
                                            'discount': dummyContext.row.discount,
                                            'tax': dummyContext.row.tax,
                                            'further_tax': dummyContext.row.furtherTax,
                                            'subtotal': dummyContext.totals.subtotal,
                                            'tax_amount': dummyContext.totals.tax_amount,
                                            'discount_amount': dummyContext.totals.discount_amount,
                                            'grand_total': dummyContext.totals.grand_total,
                                            'paid_amount': dummyContext.totals.paid_amount,
                                            'balance_due': dummyContext.totals.balance_due,
                                          };
                                          let result = 0;
                                          let pendingOp = '+';
                                          for (const tok of col.formula_tokens) {
                                            let num = 0;
                                            if (tok.type === 'field') num = fieldMap[tok.fieldKey as string] ?? 0;
                                            else if (tok.type === 'constant') num = parseFloat(String(tok.constant ?? '0')) || 0;
                                            else if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
                                            if (pendingOp === '+') result += num;
                                            else if (pendingOp === '-') result -= num;
                                            else if (pendingOp === '*') result *= num;
                                            else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
                                          }
                                          val = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                        } catch { val = '0.00'; }
                                      }
                                      return (
                                        <td key={col.column_id} className="py-1 px-1.5" style={{ textAlign: col.alignment || 'left' }}>
                                          {val}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          );
                        } else if (f.field_name === 'QR Code') {
                          elementContent = (
                            <div className="w-10 h-10 border p-0.5 rounded bg-white flex items-center justify-center">
                              <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-2 2h2v2-2v-2zm2 2h3v3h-3v-3zm-2 2h2v2-2v-2zm4-4h2v4h-2v-4zm0 6h2v1h-2v-1z" />
                              </svg>
                            </div>
                          );
                        } else if (f.field_name === 'Barcode') {
                          elementContent = (
                            <svg className="h-6 w-full text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
                              <rect width="100" height="20" fill="white"/>
                              <rect x="5" y="2" width="2" height="16" fill="currentColor"/>
                              <rect x="10" y="2" width="4" height="16" fill="currentColor"/>
                              <rect x="16" y="2" width="1" height="16" fill="currentColor"/>
                              <rect x="20" y="2" width="3" height="16" fill="currentColor"/>
                              <rect x="25" y="2" width="5" height="16" fill="currentColor"/>
                              <rect x="32" y="2" width="2" height="16" fill="currentColor"/>
                              <rect x="36" y="2" width="1" height="16" fill="currentColor"/>
                              <rect x="40" y="2" width="4" height="16" fill="currentColor"/>
                              <rect x="48" y="2" width="2" height="16" fill="currentColor"/>
                              <rect x="52" y="2" width="3" height="16" fill="currentColor"/>
                              <rect x="58" y="2" width="5" height="16" fill="currentColor"/>
                            </svg>
                          );
                        } else if (f.field_name === 'FBR Logo') {
                          elementContent = (
                            <div className="flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">
                              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                <path d="M2 12h20" />
                              </svg>
                              <div className="flex flex-col text-left leading-[1.1]">
                                <span>FBR</span>
                                <span className="text-[5px] text-emerald-500 font-medium font-sans">Pakistan</span>
                              </div>
                            </div>
                          );
                        } else if (f.field_name === 'Company Stamp') {
                          elementContent = (
                            <div className="w-18 h-9 border border-dashed border-slate-355 rounded-full flex flex-col items-center justify-center opacity-65 select-none bg-slate-50/50">
                              <span className="text-[5px] font-bold text-slate-455">Company Stamp</span>
                              <span className="text-[4px] text-slate-355">Seal Here</span>
                            </div>
                          );
                        } else if (f.field_name === 'Signature') {
                          elementContent = (
                            <div className="w-full text-center">
                              <div className="border-b border-slate-350 w-full h-3" />
                              {isEditingLabel ? (
                                <input
                                  type="text"
                                  value={editingLabelText}
                                  onChange={e => setEditingLabelText(e.target.value)}
                                  onBlur={handleSaveInlineLabel}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveInlineLabel();
                                  }}
                                  className="w-full text-[9px] border p-0.5 rounded outline-none mt-0.5 text-center"
                                  autoFocus
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <span 
                                  className="text-[7px] text-slate-400 block mt-0.5 cursor-pointer hover:bg-slate-50 rounded px-1"
                                  onDoubleClick={(e) => handleDoubleClick(e, f.field_id, f.custom_label || 'Seller Signature')}
                                >
                                  {f.custom_label || 'Seller Signature'}
                                </span>
                              )}
                            </div>
                          );
                        } else if (['Subtotal', 'Grand Total', 'Balance Due', 'Tax Amount', 'Discount Amount', 'Shipping Charges', 'Round Off', 'Received Amount'].includes(f.field_name)) {
                          const isSpaceBetween = !f.alignment || f.alignment === 'left';
                          elementContent = (
                            <div className="flex w-full items-center" style={{ justifyContent: isSpaceBetween ? 'space-between' : f.alignment === 'center' ? 'center' : 'flex-end', gap: '8px' }}>
                              {isEditingLabel ? (
                                <input
                                  type="text"
                                  value={editingLabelText}
                                  onChange={e => setEditingLabelText(e.target.value)}
                                  onBlur={handleSaveInlineLabel}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveInlineLabel();
                                  }}
                                  className="w-[60%] text-[9px] border p-0.5 rounded outline-none"
                                  autoFocus
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <span 
                                  className="text-slate-400 font-bold mr-1 cursor-pointer hover:bg-slate-50 rounded px-1"
                                  onDoubleClick={(e) => handleDoubleClick(e, f.field_id, f.custom_label || f.field_name)}
                                  style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}
                                >
                                  {f.custom_label || f.field_name}:
                                </span>
                              )}
                              <span className="font-extrabold" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{f.field_name === 'Balance Due' || f.field_name === 'Grand Total' || f.field_name === 'Subtotal' ? '8,450.00' : '0.00'}</span>
                            </div>
                          );
                        } else {
                          const sampleVal = 
                            f.field_name === 'Company Name' ? 'Antigravity Studio' :
                            f.field_name === 'Company Address' ? '452 Innovation Blvd, San Francisco, CA' :
                            f.field_name === 'Phone' ? '+1 (555) 012-3456' :
                            f.field_name === 'Email' ? 'contact@antigravity.studio' :
                            f.field_name === 'Website' ? 'www.antigravity.studio' :
                            f.field_name === 'NTN' ? '1234567-8' :
                            f.field_name === 'STRN' || f.field_name === 'STN' || f.field_name === 'STN / STRN' ? '03-00-1234-567-89' :
                            f.field_name === 'Customer Name' ? 'BlueRitt Technologies' :
                            f.field_name === 'Customer Address' ? 'House 42, Street 5, Karachi, PK' :
                            f.field_name === 'Mobile' ? '0300-1234567' :
                            f.field_name === 'Customer NTN' ? '9876543-2' :
                            f.field_name === 'Customer STRN' ? '03-09-9999-001-22' :
                            f.field_name === 'Customer CNIC' ? '42201-1234567-1' :
                            f.field_name === 'Customer Code' ? 'CUST-9928' :
                            f.field_name === 'Customer Email' ? 'billing@blueritt.com' :
                            f.field_name === 'Invoice Number' ? 'SI-000248' :
                            f.field_name === 'Date' || f.field_name === 'Invoice Date' ? '2026-06-11' :
                            f.field_name === 'Due Date' ? '2026-07-11' :
                            f.field_name === 'Sales Person' ? 'Ahmed Raza' :
                            f.field_name === 'Reference Number' ? 'REF-992' :
                            f.field_name === 'Warehouse' ? 'Lahore Central' :
                            f.field_name === 'Payment Terms' ? 'Net 30' :
                            f.field_name === 'FBR Invoice Number' ? 'FBR-INV-1092837' :
                            f.field_name === 'Prepared By' ? 'Aman Khan' :
                            f.field_name === 'Received By' ? 'Manager' :
                            f.field_name === 'Remarks' ? 'Remarks details go here.' :
                            f.field_name === 'Terms & Conditions' ? 'Standard terms apply.' : 
                            f.field_name === 'Notes' ? 'Goods once sold are non-refundable.' : 'Sample Value';
                          
                          elementContent = (
                            <div className="w-full flex" style={{ justifyContent: f.alignment === 'center' ? 'center' : f.alignment === 'right' ? 'flex-end' : 'flex-start' }}>
                              {isEditingLabel ? (
                                <input
                                  type="text"
                                  value={editingLabelText}
                                  onChange={e => setEditingLabelText(e.target.value)}
                                  onBlur={handleSaveInlineLabel}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveInlineLabel();
                                  }}
                                  className="w-full text-[9px] border p-0.5 rounded outline-none"
                                  autoFocus
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <div className="inline-flex items-center flex-wrap" onDoubleClick={(e) => handleDoubleClick(e, f.field_id, f.custom_label || f.field_name)}>
                                  <strong className="text-slate-400 mr-1" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{f.custom_label || f.field_name}: </strong>
                                  <span className="text-slate-700" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{sampleVal}</span>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={f.field_id}
                            style={{
                              position: 'absolute',
                              left: `${f.position_x ?? 5}%`,
                              top: `${f.position_y ?? 5}%`,
                              width: f.width_percent ? `${f.width_percent}%` : 'auto',
                              height: f.height_px ? `${f.height_px}px` : 'auto',
                              fontSize: f.font_size ? `${f.font_size}px` : '10px',
                              fontWeight: f.font_weight === 'bold' || f.is_bold ? 'bold' : f.font_weight === 'semibold' ? '600' : 'normal',
                              color: f.color || '#1e293b',
                              background: isSelected ? `${brand.primary}10` : (f.background || 'transparent'),
                              border: f.border || 'none',
                              padding: f.padding || '2px',
                              marginTop: f.margin_top ? `${f.margin_top}px` : undefined,
                              marginBottom: f.margin_bottom ? `${f.margin_bottom}px` : undefined,
                              textAlign: f.alignment || 'left',
                              cursor: 'move',
                              zIndex: isSelected ? 50 : 10,
                              outline: isSelected ? `2px dashed ${brand.primary}` : '1px dashed transparent',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: f.alignment === 'center' ? 'center' : f.alignment === 'right' ? 'flex-end' : 'flex-start',
                              ...parseCustomCss(f.custom_css)
                            }}
                            className="hover:outline-blue-300 rounded group select-none relative"
                            onMouseDown={(e) => handleMouseDown(e, f.field_id, 'default', f.position_x ?? 5, f.position_y ?? 5)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldId(f.field_id);
                              setSelectedColumnId(null);
                              setSelectedCustomFieldId(null);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldId(f.field_id);
                              setSelectedColumnId(null);
                              setSelectedCustomFieldId(null);
                              setShowFieldPropertiesModal(true);
                            }}
                          >
                            {elementContent}
                            {isSelected && (
                              <div
                                className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-50 rounded-tl border-t border-l"
                                style={{
                                  backgroundColor: brand.primary,
                                  borderColor: 'white'
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, f.field_id, 'default', f.width_percent ?? 50, f.height_px, e.currentTarget.parentElement)}
                              />
                            )}
                          </div>
                        );
                      })}

                    {/* Render Custom Fields in Free Layout */}
                    {activeCustomFields
                      .filter(cf => cf.is_visible)
                      .map(cf => {
                        const isSelected = selectedCustomFieldId === cf.custom_field_id;
                        const isEditingLabel = editingLabelId === cf.custom_field_id;

                        return (
                          <div
                            key={cf.custom_field_id}
                            style={{
                              position: 'absolute',
                              left: `${cf.position_x ?? 10}%`,
                              top: `${cf.position_y ?? 60}%`,
                              width: cf.width_percent ? `${cf.width_percent}%` : 'auto',
                              height: cf.height_px ? `${cf.height_px}px` : 'auto',
                              fontSize: cf.font_size ? `${cf.font_size}px` : '10px',
                              fontWeight: cf.font_weight === 'bold' || cf.is_bold ? 'bold' : cf.font_weight === 'semibold' ? '600' : 'normal',
                              color: cf.color || '#1e293b',
                              background: isSelected ? `${brand.primary}10` : (cf.background || 'transparent'),
                              border: cf.border || 'none',
                              padding: cf.padding || '2px',
                              marginTop: cf.margin_top ? `${cf.margin_top}px` : undefined,
                              marginBottom: cf.margin_bottom ? `${cf.margin_bottom}px` : undefined,
                              textAlign: cf.alignment || 'left',
                              cursor: 'move',
                              zIndex: isSelected ? 50 : 10,
                              outline: isSelected ? `2px dashed ${brand.primary}` : '1px dashed transparent',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: cf.alignment === 'center' ? 'center' : cf.alignment === 'right' ? 'flex-end' : 'flex-start',
                              ...parseCustomCss(cf.custom_css)
                            }}
                            className="hover:outline-blue-300 rounded group select-none relative"
                            onMouseDown={(e) => handleMouseDown(e, cf.custom_field_id, 'custom', cf.position_x ?? 10, cf.position_y ?? 60)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomFieldId(cf.custom_field_id);
                              setSelectedFieldId(null);
                              setSelectedColumnId(null);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomFieldId(cf.custom_field_id);
                              setSelectedFieldId(null);
                              setSelectedColumnId(null);
                              setShowFieldPropertiesModal(true);
                            }}
                          >
                            <div className="w-full flex" style={{ justifyContent: cf.alignment === 'center' ? 'center' : cf.alignment === 'right' ? 'flex-end' : 'flex-start' }}>
                              {isEditingLabel ? (
                                  <input
                                    type="text"
                                    value={editingLabelText}
                                    onChange={e => setEditingLabelText(e.target.value)}
                                    onBlur={handleSaveInlineLabel}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSaveInlineLabel();
                                    }}
                                    className="w-full text-[9px] border p-0.5 rounded outline-none"
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <div className="inline-flex items-center flex-wrap" onDoubleClick={(e) => handleDoubleClick(e, cf.custom_field_id, cf.custom_label || cf.field_name)}>
                                    <strong className="text-slate-400 mr-1" style={{ color: cf.color || undefined, fontWeight: cf.is_bold ? 'bold' : 'normal' }}>{cf.custom_label || cf.field_name}: </strong>
                                    <span className="text-slate-700" style={{ color: cf.color || undefined, fontWeight: cf.is_bold ? 'bold' : 'normal' }}>{getSampleValue(cf.field_name)}</span>
                                  </div>
                                )}
                            </div>
                              {isSelected && (
                                <div
                                  className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-50 rounded-tl border-t border-l"
                                  style={{
                                    backgroundColor: brand.primary,
                                    borderColor: 'white'
                                  }}
                                  onMouseDown={(e) => handleResizeMouseDown(e, cf.custom_field_id, 'custom', cf.width_percent ?? 50, cf.height_px, e.currentTarget.parentElement)}
                                />
                              )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div
                  ref={containerRefCallback}
                  className="flex-grow bg-slate-100 overflow-y-auto overflow-x-hidden relative p-4 flex flex-col items-center custom-scrollbar"
                >
                  <div
                    ref={innerContentRefCallback}
                    style={{
                      width: activeTemplate?.paper_size === 'Thermal' ? '380px' : '794px',
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top center',
                      marginBottom: `${(previewScale - 1) * contentHeight}px`,
                      flexShrink: 0,
                    }}
                    className="bg-white border border-slate-350 rounded-lg p-6 shadow-md transition-all duration-150"
                  >
                    {activeTemplate?.paper_size === 'Thermal' ? (
                    <div className="flex flex-col gap-4 text-[9px]">
                      {activeSections.filter(sec => sec.is_visible).map((sec) => {
                        if (sec.section_name === 'Attachments') {
                          return (
                            <div key={sec.section_id} className="space-y-1 py-1 border-b">
                              <span className="text-[9px] font-bold text-slate-400 block">Attachments</span>
                              <div className="flex gap-2 text-[8px] text-blue-500">
                                <span className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                                  <FileText className="w-2.5 h-2.5 text-slate-400" />
                                  delivery_proof.pdf
                                </span>
                              </div>
                            </div>
                          );
                        }

                        const dynamicFields = renderSectionFields(sec.section_name);
                        if (!dynamicFields) return null;

                        return (
                          <div key={sec.section_id} className="w-full"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField(sec.section_name); }}
                          >
                            <span 
                              className="text-[8px] font-bold text-slate-400 block border-b pb-0.5 mb-1 uppercase tracking-wider cursor-pointer hover:bg-slate-100 px-1 rounded"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setSelectedSectionId(sec.section_id);
                                setShowSectionPropertiesModal(true);
                              }}
                            >
                              {sec.section_name}
                            </span>
                            {dynamicFields}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // BEAUTIFUL A4/LETTER SOLID LAYOUT MATCHING USER'S IMAGE
                    <div className="space-y-6 flex flex-col justify-start">
                      <div>
                        {/* 1. Header (Company details & centered Title) */}
                        {activeSections.find(s => s.section_name === 'Company Information' && s.is_visible) && (
                          <div className="w-full flex justify-between items-start border-b pb-4 mb-2 cursor-pointer hover:bg-slate-50/30"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField('Company Information'); }}
                               onDoubleClick={(e) => {
                                 e.stopPropagation();
                                 const s = activeSections.find(sec => sec.section_name === 'Company Information');
                                 if (s) {
                                   setSelectedSectionId(s.section_id);
                                   setShowSectionPropertiesModal(true);
                                 }
                               }}
                          >
                            <div className="flex-grow">
                              {renderSectionFields('Company Information')}
                            </div>
                          </div>
                        )}

                        {/* Centered Document Title */}
                        <div className="w-full text-center my-3">
                          <h1 className="text-base font-extrabold tracking-wider text-slate-800 uppercase pb-1 border-b-2 border-slate-700 inline-block">
                            {activeTemplate?.document_type || 'Sale Tax Invoice'}
                          </h1>
                        </div>

                        {/* 2. Side-by-Side Information Boxes (Invoice & Customer details) */}
                        <div className="grid grid-cols-2 gap-4 mb-4 items-stretch">
                          {activeSections.find(s => s.section_name === 'Invoice Information' && s.is_visible) ? (
                            <div className="flex flex-col space-y-1.5 h-full justify-between cursor-pointer hover:bg-slate-50/30"
                                 onDragOver={e => e.preventDefault()}
                                 onDrop={() => { if (draggedElement) handleSectionDropField('Invoice Information'); }}
                                 onDoubleClick={(e) => {
                                   e.stopPropagation();
                                   const s = activeSections.find(sec => sec.section_name === 'Invoice Information');
                                   if (s) {
                                     setSelectedSectionId(s.section_id);
                                     setShowSectionPropertiesModal(true);
                                   }
                                 }}
                            >
                              {(() => {
                                const secFields = activeFields.filter(f => f.section_name === 'Invoice Information');
                                const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === 'Invoice Information');
                                const combined = [
                                  ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                  ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                                ].sort((a, b) => a.display_order - b.display_order);

                                return combined.map(item => {
                                  const sampleVal = 
                                    item.field_name === 'Invoice Number' ? 'SI-000248' :
                                    item.field_name === 'Date' || item.field_name === 'Invoice Date' ? '2026-06-11' :
                                    item.field_name === 'Due Date' ? '2026-07-11' :
                                    item.field_name === 'Sales Person' ? 'Ahmed Raza' :
                                    item.field_name === 'Reference Number' ? 'REF-992' :
                                    item.field_name === 'Warehouse' ? 'Lahore Central' :
                                    item.field_name === 'Payment Terms' ? 'Net 30' :
                                    item.field_name === 'FBR Invoice Number' ? 'FBR-INV-1092837' : 'Sample';

                                  const isSelected = selectedFieldId === (item.isCustom ? item.custom_field_id : item.field_id);
                                  const isEditingLabel = editingLabelId === (item.isCustom ? item.custom_field_id : item.field_id);

                                  const labelColor = item.label_color || item.color;
                                  const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
                                  const valueColor = item.value_color || item.color;
                                  const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

                                  const borderVal = item.border === 'bottom-light' ? '1px solid #cbd5e1' :
                                                    item.border === 'bottom-slate' ? '1px solid #475569' :
                                                    item.border === 'bottom-black' ? '1px solid #000000' :
                                                    item.border === 'none' ? 'none' :
                                                    item.border || '1px solid #cbd5e1';

                                  const borderStyles = item.border && (item.border.startsWith('bottom-') || item.border === 'none') ? {
                                    borderBottom: item.border === 'none' ? 'none' : borderVal,
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none'
                                  } : {
                                    border: isSelected ? '1px solid rgb(59, 130, 246)' : borderVal
                                  };

                                  return (
                                    <div 
                                      key={item.isCustom ? item.custom_field_id : item.field_id} 
                                      className={`rounded px-3 py-1.5 flex justify-between items-center cursor-pointer text-[9px] ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                                      style={{ 
                                        ...borderStyles,
                                        backgroundColor: item.background || '#ffffff',
                                        fontSize: item.font_size ? `${item.font_size}px` : undefined,
                                        padding: item.padding || undefined,
                                        marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                                        opacity: item.is_visible ? 1 : 0.45,
                                        border: item.is_visible ? borderStyles.border : '1px dashed #cbd5e1',
                                      }}
                                      onClick={() => {
                                        if (item.isCustom) {
                                          setSelectedCustomFieldId(item.custom_field_id);
                                          setSelectedFieldId(null);
                                          setSelectedColumnId(null);
                                        } else {
                                          setSelectedFieldId(item.field_id);
                                          setSelectedCustomFieldId(null);
                                          setSelectedColumnId(null);
                                        }
                                      }}
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (item.isCustom) {
                                          setSelectedCustomFieldId(item.custom_field_id);
                                          setSelectedFieldId(null);
                                          setSelectedColumnId(null);
                                        } else {
                                          setSelectedFieldId(item.field_id);
                                          setSelectedCustomFieldId(null);
                                          setSelectedColumnId(null);
                                        }
                                        setShowFieldPropertiesModal(true);
                                      }}
                                    >
                                      {isEditingLabel ? (
                                        <input
                                          type="text"
                                          value={editingLabelText}
                                          onChange={e => setEditingLabelText(e.target.value)}
                                          onBlur={handleSaveInlineLabel}
                                          onKeyDown={e => { if (e.key === 'Enter') handleSaveInlineLabel(); }}
                                          className="w-full text-[9px] border p-0.5 rounded outline-none"
                                          autoFocus
                                          onClick={e => e.stopPropagation()}
                                        />
                                      ) : (
                                        <strong 
                                          className="text-slate-500 mr-2 cursor-pointer hover:bg-slate-50 rounded px-1"
                                          onDoubleClick={(e) => handleDoubleClick(e, item.isCustom ? item.custom_field_id : item.field_id, item.custom_label || item.field_name)}
                                          style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}
                                        >
                                          {item.custom_label || item.field_name}:
                                        </strong>
                                      )}
                                      <span className="text-slate-850" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{sampleVal}</span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : <div />}

                          {activeSections.find(s => s.section_name === 'Customer Information' && s.is_visible) ? (
                            <div 
                              className="rounded p-3 flex flex-col justify-start text-[9px] cursor-pointer hover:bg-slate-50/30"
                              style={{ 
                                border: '1px solid #cbd5e1', 
                                backgroundColor: '#ffffff', 
                                color: '#1e293b',
                                minHeight: '100%' 
                              }}
                              onDragOver={e => e.preventDefault()}
                              onDrop={() => { if (draggedElement) handleSectionDropField('Customer Information'); }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                const s = activeSections.find(sec => sec.section_name === 'Customer Information');
                                if (s) {
                                  setSelectedSectionId(s.section_id);
                                  setShowSectionPropertiesModal(true);
                                }
                              }}
                            >
                              <div className="font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-800 uppercase tracking-wider text-left text-[9px]">
                                Customer Details
                              </div>
                              <div className="space-y-1.5">
                                {(() => {
                                  const secFields = activeFields.filter(f => f.section_name === 'Customer Information');
                                  const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === 'Customer Information');
                                  const combined = [
                                    ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                    ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                                  ].sort((a, b) => a.display_order - b.display_order);

                                  return combined.map(item => {
                                    const sampleVal = 
                                      item.field_name === 'Customer Name' ? 'BlueRitt Technologies' :
                                      item.field_name === 'Customer Address' ? 'House 42, Street 5, Karachi, PK' :
                                      item.field_name === 'Mobile' ? '0300-1234567' :
                                      item.field_name === 'Customer NTN' ? '9876543-2' :
                                      item.field_name === 'Customer STRN' ? '03-09-9999-001-22' :
                                      item.field_name === 'Customer CNIC' ? '42201-1234567-1' :
                                      item.field_name === 'Customer Code' ? 'CUST-9928' :
                                      item.field_name === 'Customer Email' ? 'billing@blueritt.com' : 'Sample';

                                    const isSelected = selectedFieldId === (item.isCustom ? item.custom_field_id : item.field_id);
                                    const isEditingLabel = editingLabelId === (item.isCustom ? item.custom_field_id : item.field_id);

                                    const labelColor = item.label_color || item.color;
                                    const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
                                    const valueColor = item.value_color || item.color;
                                    const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

                                    const borderVal = item.border === 'bottom-light' ? '1px solid #cbd5e1' :
                                                      item.border === 'bottom-slate' ? '1px solid #475569' :
                                                      item.border === 'bottom-black' ? '1px solid #000000' :
                                                      item.border === 'none' ? 'none' :
                                                      item.border || '1px solid #f1f5f9';

                                    const borderStyles = item.border && (item.border.startsWith('bottom-') || item.border === 'none') ? {
                                      borderBottom: item.border === 'none' ? 'none' : borderVal,
                                      borderTop: 'none',
                                      borderLeft: 'none',
                                      borderRight: 'none'
                                    } : {
                                      borderBottom: borderVal
                                    };

                                    return (
                                      <div 
                                        key={item.isCustom ? item.custom_field_id : item.field_id} 
                                        className={`flex justify-between items-start pb-1.5 last:border-0 last:pb-0 cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                                        style={{
                                          ...borderStyles,
                                          fontSize: item.font_size ? `${item.font_size}px` : undefined,
                                          padding: item.padding || undefined,
                                          marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                                          opacity: item.is_visible ? 1 : 0.45,
                                          borderBottom: item.is_visible ? borderStyles.borderBottom : '1px dashed #cbd5e1',
                                        }}
                                        onClick={() => {
                                        if (item.isCustom) {
                                          setSelectedCustomFieldId(item.custom_field_id);
                                          setSelectedFieldId(null);
                                          setSelectedColumnId(null);
                                        } else {
                                          setSelectedFieldId(item.field_id);
                                          setSelectedCustomFieldId(null);
                                          setSelectedColumnId(null);
                                        }
                                      }}
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (item.isCustom) {
                                          setSelectedCustomFieldId(item.custom_field_id);
                                          setSelectedFieldId(null);
                                          setSelectedColumnId(null);
                                        } else {
                                          setSelectedFieldId(item.field_id);
                                          setSelectedCustomFieldId(null);
                                          setSelectedColumnId(null);
                                        }
                                        setShowFieldPropertiesModal(true);
                                      }}
                                      >
                                        {isEditingLabel ? (
                                          <input
                                            type="text"
                                            value={editingLabelText}
                                            onChange={e => setEditingLabelText(e.target.value)}
                                            onBlur={handleSaveInlineLabel}
                                            onKeyDown={e => { if (e.key === 'Enter') handleSaveInlineLabel(); }}
                                            className="w-[60%] text-[8px] border p-0.5 rounded outline-none"
                                            autoFocus
                                            onClick={e => e.stopPropagation()}
                                          />
                                        ) : (
                                          <strong 
                                            className="text-slate-500 mr-2 shrink-0 cursor-pointer hover:bg-slate-50 rounded px-1"
                                            onDoubleClick={(e) => handleDoubleClick(e, item.isCustom ? item.custom_field_id : item.field_id, item.custom_label || item.field_name)}
                                            style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}
                                          >
                                            {item.custom_label || item.field_name}:
                                          </strong>
                                        )}
                                        <span className="text-slate-800 text-right break-words max-w-[65%]" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{sampleVal}</span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          ) : <div />}
                        </div>

                        {/* 3. Product Table */}
                        {activeSections.find(s => s.section_name === 'Product Table' && s.is_visible) && (
                          <div className="w-full my-4 cursor-pointer hover:bg-slate-50/30"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField('Product Table'); }}
                               onDoubleClick={(e) => {
                                 e.stopPropagation();
                                 const s = activeSections.find(sec => sec.section_name === 'Product Table');
                                 if (s) {
                                   setSelectedSectionId(s.section_id);
                                   setShowSectionPropertiesModal(true);
                                 }
                               }}
                          >
                            {renderSectionFields('Product Table')}
                          </div>
                        )}

                        {/* Attachments if any */}
                        <div className="space-y-1 py-1 border-b w-full">
                          <span className="text-[9px] font-bold text-slate-400 block">Attachments</span>
                          <div className="flex gap-2 text-[8px] text-blue-500">
                            <span className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                              <FileText className="w-2.5 h-2.5 text-slate-400" />
                              delivery_proof.pdf
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Footer Section (Side-by-Side Note & Totals Box) */}
                      <div className="grid grid-cols-12 gap-6 items-end w-full pt-4 border-t">
                        {/* Left: Notes, Remarks, Signatures */}
                        <div className="col-span-7 space-y-4"
                             onDragOver={e => e.preventDefault()}
                             onDrop={() => { if (draggedElement) handleSectionDropField('Footer'); }}
                        >
                          <div className="space-y-3">
                            {renderSectionFields('Footer')}
                          </div>
                        </div>
                        {/* Right: Bordered Totals Box */}
                        {activeSections.find(s => s.section_name === 'Totals' && s.is_visible) && (
                          <div className="col-span-5 border border-slate-300 rounded p-3 bg-slate-50/50 text-[9px] cursor-pointer hover:bg-slate-55/30"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField('Totals'); }}
                               onDoubleClick={(e) => {
                                 e.stopPropagation();
                                 const s = activeSections.find(sec => sec.section_name === 'Totals');
                                 if (s) {
                                   setSelectedSectionId(s.section_id);
                                   setShowSectionPropertiesModal(true);
                                 }
                               }}
                          >
                            <div className="font-bold border-b pb-1 mb-2 text-slate-700 uppercase tracking-wider text-right">Summary</div>
                            <div className="space-y-1.5 flex flex-col items-end w-full">
                              {renderSectionFields('Totals')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ── Unified Layout Settings Modal ── */}
        <Modal
          isOpen={showLayoutModal}
          onClose={() => setShowLayoutModal(false)}
          title="🛠️ Layout Settings"
          style={{ width: '35%', maxWidth: '35%' }}
          noPadding={true}
          scrollableBody={false}
          footer={
            <Button variant="white" size="sm" onClick={() => setShowLayoutModal(false)}>
              Close
            </Button>
          }
        >
          {(() => {
            const query = fieldsSearchQuery.toLowerCase().trim();

            const renderAccordionSection = (title: string, sectionKey: string, matchCount: number, totalCount: number, content: React.ReactNode) => {
              const isOpen = expandedSectionId === sectionKey;
              return (
                <div style={{
                  background: '#fff',
                  border: '1.5px solid',
                  borderColor: isOpen ? `${brand.primary}35` : '#e2e8f0',
                  borderRadius: 12,
                  marginBottom: 10,
                  overflow: 'hidden',
                  boxShadow: isOpen ? '0 4px 12px -2px rgb(0 0 0 / 0.05), 0 2px 6px -1px rgb(0 0 0 / 0.03)' : 'none',
                  transition: 'all 0.2s ease-in-out'
                }}>
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedSectionId(isOpen ? null : sectionKey)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: isOpen ? `${brand.primary}06` : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: isOpen ? brand.primary : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                      </span>
                      {query !== '' ? (
                        <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: matchCount > 0 ? '#dcfce7' : '#f1f5f9', color: matchCount > 0 ? '#15803d' : '#64748b' }}>
                          {matchCount} match{matchCount !== 1 ? 'es' : ''}
                        </span>
                      ) : (
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: '#f1f5f9', color: '#64748b' }}>
                          {totalCount}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      style={{
                        width: 15,
                        height: 15,
                        color: isOpen ? brand.primary : '#94a3b8',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>

                  {/* Content */}
                  {isOpen && (
                    <div style={{
                      padding: '12px 14px',
                      borderTop: '1.5px solid #f1f5f9',
                      background: '#fff',
                    }}>
                      {content}
                    </div>
                  )}
                </div>
              );
            };

            const renderFieldsForSection = (sectionName: string) => {
              const secFields = activeFields.filter(f => f.section_name === sectionName);
              const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === sectionName);
              const combined = [
                ...secFields.map(f => ({ ...f, isCustom: false as const, id: f.field_id })),
                ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const, id: cf.custom_field_id }))
              ].sort((a, b) => a.display_order - b.display_order);

              const filtered = query
                ? combined.filter(f => f.field_name.toLowerCase().includes(query) || (f.custom_label && f.custom_label.toLowerCase().includes(query)))
                : combined;

              return {
                matchCount: filtered.length,
                totalCount: combined.length,
                node: (
                  <div className="space-y-1.5">
                    {filtered.length === 0 && (
                      <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                        {query ? 'No matching fields' : 'No fields in this section'}
                      </div>
                    )}
                    {filtered.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-2.5 py-1.5 border border-slate-100 bg-white hover:bg-slate-50/50 rounded-lg text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-semibold truncate ${item.is_visible ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                            {item.custom_label || item.field_name}
                          </span>
                          {item.isCustom && (
                            <span className="text-[8px] px-1 bg-slate-100 border text-slate-500 rounded font-normal capitalize">
                              {item.field_type}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveFieldOrder(item.id, item.isCustom, 'up')}
                              className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === filtered.length - 1}
                              onClick={() => moveFieldOrder(item.id, item.isCustom, 'down')}
                              className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const val = !item.is_visible;
                              if (item.isCustom) {
                                updateCustomFieldProperty(item.id, { is_visible: val });
                              } else {
                                updateFieldProperty(item.id, { is_visible: val });
                              }
                            }}
                            className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-indigo-650 cursor-pointer"
                            title={item.is_visible ? "Hide field" : "Show field"}
                          >
                            {item.is_visible ? (
                              <Eye className="w-3.5 h-3.5 text-indigo-650" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Edit styles & settings"
                            onClick={() => {
                              if (item.isCustom) {
                                setSelectedCustomFieldId(item.id);
                                setSelectedFieldId(null);
                                setSelectedColumnId(null);
                              } else {
                                setSelectedFieldId(item.id);
                                setSelectedCustomFieldId(null);
                                setSelectedColumnId(null);
                              }
                              setShowFieldPropertiesModal(true);
                            }}
                            className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-indigo-650 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          {item.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomField(item.id)}
                              className="p-0.5 rounded hover:bg-red-50 text-slate-355 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {(sectionName === 'Totals' || sectionName === 'Custom Fields') && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <Button
                          variant="white"
                          size="xs"
                          icon={Plus}
                          style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                          onClick={() => {
                            setFormulaPlacement(sectionName === 'Totals' ? 'totals' : 'custom');
                            setEditingFormulaId(null);
                            resetFormulaModal();
                            setShowLayoutModal(false);
                            setShowFormulasModal(true);
                          }}
                        >
                          Add Custom Field
                        </Button>
                      </div>
                    )}
                  </div>
                )
              };
            };

            const renderTableColumnsSection = () => {
              const filtered = query
                ? activeColumns.filter(c => c.column_name.toLowerCase().includes(query) || (c.custom_label && c.custom_label.toLowerCase().includes(query)))
                : activeColumns;

              return {
                matchCount: filtered.length,
                totalCount: activeColumns.length,
                node: (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-[10px] font-bold text-slate-400">Drag to reorder table columns.</span>
                      <Button
                        variant="white"
                        size="xs"
                        icon={Plus}
                        style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                        onClick={() => {
                          setFormulaPlacement('column');
                          setEditingFormulaId(null);
                          resetFormulaModal();
                          setShowLayoutModal(false);
                          setShowFormulasModal(true);
                        }}
                      >
                        Add Column
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      {filtered.length === 0 && (
                        <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                          No matching columns
                        </div>
                      )}
                      {filtered.map((col) => (
                        <div
                          key={col.column_id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedColumnId(col.column_id);
                            e.dataTransfer.setData('text/plain', col.column_id);
                          }}
                          onDragOver={handleColumnDragOver}
                          onDrop={(e) => handleColumnDrop(e, col.column_id)}
                          className="flex items-center justify-between px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs cursor-move hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-grow">
                            <Move className="w-3.5 h-3.5 text-slate-400 cursor-grab shrink-0" />
                            <span className={`font-semibold truncate ${col.is_visible ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                              {col.custom_label || col.column_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16">
                              <Input
                                variant="compact"
                                placeholder="Width"
                                value={col.width || ''}
                                onChange={e => updateColumnProperty(col.column_id, { width: e.target.value })}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => updateColumnProperty(col.column_id, { is_visible: !col.is_visible })}
                              className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-indigo-650 cursor-pointer"
                              title={col.is_visible ? "Hide column" : "Show column"}
                            >
                              {col.is_visible ? (
                                <Eye className="w-3.5 h-3.5 text-indigo-650" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedColumnId(col.column_id);
                                setSelectedFieldId(null);
                                setSelectedCustomFieldId(null);
                                setShowColumnPropertiesModal(true);
                              }}
                              className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-indigo-650 cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>

                            {col.is_custom && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomColumn(col.column_id)}
                                className="p-1 rounded hover:bg-red-50 text-slate-355 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              };
            };

            const renderPageSectionsOrderSection = () => {
              const filtered = query
                ? activeSections.filter(sec => sec.section_name.toLowerCase().includes(query))
                : activeSections;

              return {
                matchCount: filtered.length,
                totalCount: activeSections.length,
                node: (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 border-b pb-2">
                      Drag sections to reorder how they print sequentially (Flow Layout only).
                    </p>

                    <div className="space-y-1.5">
                      {filtered.length === 0 && (
                        <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                          No matching sections
                        </div>
                      )}
                      {filtered.map((sec) => (
                        <div
                          key={sec.section_id}
                          draggable
                          onDragStart={() => handleSectionDragStart(sec.section_id)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleSectionDrop(sec.section_id)}
                          className="flex items-center justify-between px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs cursor-move hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className={`font-semibold ${sec.is_visible ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                              {sec.section_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => updateSectionProperty(sec.section_id, { is_visible: !sec.is_visible })}
                              className="p-0.5 rounded hover:bg-slate-150 text-slate-400 hover:text-indigo-650 cursor-pointer"
                              title={sec.is_visible ? "Hide section" : "Show section"}
                            >
                              {sec.is_visible ? (
                                <Eye className="w-3.5 h-3.5 text-indigo-650" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSectionId(sec.section_id);
                                setShowSectionPropertiesModal(true);
                              }}
                              className="p-1 rounded hover:bg-slate-150 text-slate-400 hover:text-indigo-650 cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              };
            };

            const companyData = renderFieldsForSection('Company Information');
            const customerData = renderFieldsForSection('Customer Information');
            const invoiceData = renderFieldsForSection('Invoice Information');
            const columnsData = renderTableColumnsSection();
            const customFieldsData = renderFieldsForSection('Custom Fields');
            const totalsData = renderFieldsForSection('Totals');
            const footerData = renderFieldsForSection('Footer');
            const pageSectionsData = renderPageSectionsOrderSection();

            return (
              <div style={{ display: 'flex', flexDirection: 'column', height: '540px', background: '#fff', overflow: 'hidden' }}>
                {/* Global Search Bar */}
                <div style={{ padding: '10px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search fields, columns, or page sections..."
                      value={fieldsSearchQuery}
                      onChange={e => setFieldsSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingLeft: 28,
                        paddingRight: 10,
                        paddingTop: 6,
                        paddingBottom: 6,
                        fontSize: 11.5,
                        border: '1px solid #e2e8f0',
                        borderRadius: 7,
                        outline: 'none',
                        background: '#fff',
                        color: '#334155'
                      }}
                    />
                  </div>
                </div>

                {/* Modal Body Container with 2 Columns */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="custom-scrollbar">
                  {/* Left Column */}
                  <div>
                    {renderAccordionSection('📂 Company Information', 'company', companyData.matchCount, companyData.totalCount, companyData.node)}
                    {renderAccordionSection('📂 Customer Information', 'customer', customerData.matchCount, customerData.totalCount, customerData.node)}
                    {renderAccordionSection('📂 Invoice Information', 'invoice', invoiceData.matchCount, invoiceData.totalCount, invoiceData.node)}
                    {renderAccordionSection('📊 Table Columns', 'columns', columnsData.matchCount, columnsData.totalCount, columnsData.node)}
                  </div>

                  {/* Right Column */}
                  <div>
                    {renderAccordionSection('✨ Custom Fields', 'custom', customFieldsData.matchCount, customFieldsData.totalCount, customFieldsData.node)}
                    {renderAccordionSection('💵 Totals', 'totals', totalsData.matchCount, totalsData.totalCount, totalsData.node)}
                    {renderAccordionSection('📝 Footer', 'footer', footerData.matchCount, footerData.totalCount, footerData.node)}
                    {renderAccordionSection('🧱 Page Sections Order', 'sections', pageSectionsData.matchCount, pageSectionsData.totalCount, pageSectionsData.node)}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>

        {/* -- Crystal Reports Formula Manager Modal -- */}
        <Modal
          isOpen={showFormulasModal}
          onClose={() => {
            setShowFormulasModal(false);
            setEditingFormulaId(null);
            resetFormulaModal();
            setFormulaValidationErrors([]);
            setFormulaDescription('');
            setFormulaCategory('summary');
            setFormulaSearchQuery('');
          }}
          title="Formula Manager"
          style={{ width: '50%', maxWidth: '50%' }}
          noPadding={true}
          scrollableBody={false}
          footer={null}
        >
          {(() => {
            const summaryFormulas = activeCustomFields.filter(cf => cf.field_type === 'formula');
            const columnFormulas  = activeColumns.filter(c => c.is_custom && c.formula_tokens && c.formula_tokens.length > 0);
            const allFormulaNames = [...summaryFormulas.map(f => f.field_name), ...columnFormulas.map(c => c.column_name)];
            const fq = formulaSearchQuery.toLowerCase().trim();
            const filteredSummary = summaryFormulas.filter(f => !fq || f.field_name.toLowerCase().includes(fq));
            const filteredColumn  = columnFormulas.filter(c  => !fq || c.column_name.toLowerCase().includes(fq));

            const fieldMap: Record<string, number> = {
              subtotal: 7500, tax_amount: 1125, discount_amount: 500,
              shipping_charges: 150, other_charges: 0, round_off: 0,
              grand_total: 8275, paid_amount: 5000, balance_due: 3275,
              total_qty: 12, total_items: 3,
              line_qty: 5, line_unit_price: 1500, line_total: 7500,
              line_discount: 250, line_tax: 625,
            };

            const evalTokens = (tokens: FormulaToken[]): number => {
              try {
                let result = 0; let pendingOp = '+';
                for (const tok of tokens) {
                  if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
                  const num = tok.type === 'field' ? (fieldMap[tok.fieldKey ?? ''] ?? 0) : parseFloat(String(tok.constant ?? '0')) || 0;
                  if (pendingOp === '+') result += num;
                  else if (pendingOp === '-') result -= num;
                  else if (pendingOp === '*') result *= num;
                  else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
                  else if (pendingOp === '%') result = result * num / 100;
                }
                return result;
              } catch { return 0; }
            };

            const tokensToExpr = (tokens: FormulaToken[]) =>
              tokens.map(tok =>
                tok.type === 'field' ? (tok.fieldLabel ?? '') :
                tok.type === 'operator' ? ` ${tok.operator} ` : String(tok.constant ?? '')
              ).join('');

            const validateFormula = (): string[] => {
              const errors: string[] = [];
              if (!formulaFieldName.trim()) errors.push('Formula name is required.');
              if (formulaTokens.length === 0) errors.push('Formula expression cannot be empty.');
              if (formulaTokens.length > 0 && formulaTokens[0].type === 'operator')
                errors.push('Formula cannot start with an operator.');
              if (formulaTokens.length > 0 && formulaTokens[formulaTokens.length - 1].type === 'operator')
                errors.push('Formula cannot end with an operator.');
              for (let i = 0; i < formulaTokens.length - 1; i++) {
                if (formulaTokens[i].type === 'operator' && formulaTokens[i + 1].type === 'operator')
                  errors.push('Invalid syntax: two consecutive operators.');
              }
              const editingName = editingFormulaId
                ? (summaryFormulas.find(f => f.custom_field_id === editingFormulaId)?.field_name
                    ?? columnFormulas.find(c => c.column_id === editingFormulaId)?.column_name ?? '')
                : '';
              if (allFormulaNames.filter(n => n !== editingName).some(n => n.toLowerCase() === formulaFieldName.trim().toLowerCase()))
                errors.push('A formula with this name already exists.');
              let lastOp = '';
              for (const tok of formulaTokens) {
                if (tok.type === 'operator') { lastOp = tok.operator ?? ''; continue; }
                if (lastOp === '/' && tok.type === 'constant' && (tok.constant === 0 || tok.constant === undefined))
                  errors.push('Warning: Possible division by zero detected.');
              }
              return errors;
            };

            const previewResult = formulaTokens.length > 0
              ? evalTokens(formulaTokens).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : null;
            const expressionStr = tokensToExpr(formulaTokens);

            const editingEntityName = editingFormulaId
              ? (columnFormulas.find(c => c.column_id === editingFormulaId)?.column_name
                  ?? summaryFormulas.find(f => f.custom_field_id === editingFormulaId)?.field_name
                  ?? formulaFieldName)
              : '';

            const availableFields = FORMULA_FIELD_OPTIONS.filter(f =>
              formulaCategory === 'column' ? f.section === 'Column' : (f.section === 'Totals' || f.section === 'Summary')
            );

            const handleValidatedSave = () => {
              const errors = validateFormula();
              setFormulaValidationErrors(errors);
              if (errors.length > 0) {
                const bodyEl = document.getElementById('formula-editor-body');
                if (bodyEl) {
                  bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
              }
              handleSaveFormula();
              setFormulaValidationErrors([]);
              setFormulaDescription('');
              setShowFormulasModal(false);
            };

            const handleDuplicateFormula = (id: string, isCol: boolean) => {
              if (isCol) {
                const col = columnFormulas.find(c => c.column_id === id);
                if (!col) return;
                const nid = `col-formula-${currentTemplateId}-${Date.now()}`;
                setAllColumns(prev => [...prev, { ...col, column_id: nid, column_name: `${col.column_name} (Copy)`, is_visible: false }]);
              } else {
                const cf = summaryFormulas.find(f => f.custom_field_id === id);
                if (!cf) return;
                const nid = `cf-formula-${currentTemplateId}-${Date.now()}`;
                setAllCustomFields(prev => [...prev, { ...cf, custom_field_id: nid, field_name: `${cf.field_name} (Copy)`, is_visible: false }]);
              }
            };

            const handleToggleFormula = (id: string, isCol: boolean) => {
              if (isCol) setAllColumns(prev => prev.map(c => c.column_id === id ? { ...c, is_visible: !c.is_visible } : c));
              else setAllCustomFields(prev => prev.map(cf => cf.custom_field_id === id ? { ...cf, is_visible: !cf.is_visible } : cf));
            };

            const itemStyle = (isSel: boolean, accent: string): React.CSSProperties => ({
              display: 'flex', alignItems: 'center', padding: '6px 8px',
              borderRadius: 6, cursor: 'pointer', marginBottom: 2,
              background: isSel ? `${accent}15` : 'transparent',
              border: `1px solid ${isSel ? `${accent}40` : 'transparent'}`,
            });

            return (
              <div style={{ display: 'flex', height: '620px', overflow: 'hidden' }}>

                {/* LEFT PANEL */}
                <div style={{ width: 272, flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                  <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Formula Explorer</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Search style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#94a3b8' }} />
                      <input type="text" placeholder="Search formulas..." value={formulaSearchQuery}
                        onChange={e => setFormulaSearchQuery(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 26, paddingRight: 8, paddingTop: 5, paddingBottom: 5, fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none', background: '#fff', color: '#334155' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
                    {/* Summary Formulas */}
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 4px 4px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                          Summary Formulas
                          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#6366f1', padding: '0 5px', borderRadius: 10 }}>{filteredSummary.length}</span>
                        </div>
                        <button type="button"
                          onClick={() => { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('summary'); setFormulaPlacement('custom'); }}
                          style={{ fontSize: 9, fontWeight: 700, color: brand.primary, background: `${brand.primary}15`, border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>
                          + New
                        </button>
                      </div>
                      {filteredSummary.length === 0 && <div style={{ fontSize: 10, color: '#94a3b8', padding: '5px 10px', fontStyle: 'italic', textAlign: 'center' }}>{fq ? 'No matches' : 'None created yet'}</div>}
                      {filteredSummary.map(f => {
                        const isSel = editingFormulaId === f.custom_field_id;
                        return (
                          <div key={f.custom_field_id} style={itemStyle(isSel, brand.primary)}
                            onClick={() => { setEditingFormulaId(f.custom_field_id); setFormulaFieldName(f.field_name); setFormulaPlacement(f.section_name === 'Custom Fields' ? 'custom' : 'totals'); setFormulaCategory('summary'); setFormulaTokens(f.formula_tokens || []); setFormulaValidationErrors([]); setFormulaDescription(''); }}>
                            <span style={{ fontSize: 12, marginRight: 6 }}>{'<>'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? brand.primary : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.field_name}</div>
                              <div style={{ fontSize: 9, color: f.is_visible ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{f.is_visible ? '● Active' : '○ Inactive'}</div>
                            </div>
                            {isSel && (
                              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                <button type="button" title="Duplicate" onClick={e => { e.stopPropagation(); handleDuplicateFormula(f.custom_field_id, false); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Copy style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Toggle" onClick={e => { e.stopPropagation(); handleToggleFormula(f.custom_field_id, false); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: f.is_visible ? '#22c55e' : '#94a3b8' }}><Check style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Delete" onClick={e => { e.stopPropagation(); handleRemoveCustomField(f.custom_field_id); if (editingFormulaId === f.custom_field_id) { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); } }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#f43f5e' }}><Trash2 style={{ width: 11, height: 11 }} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Column Formulas */}
                    <div style={{ marginTop: 10, marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 4px 4px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                          Table Column Formulas
                          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, background: '#fffbeb', color: '#d97706', padding: '0 5px', borderRadius: 10 }}>{filteredColumn.length}</span>
                        </div>
                        <button type="button"
                          onClick={() => { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('column'); setFormulaPlacement('column'); }}
                          style={{ fontSize: 9, fontWeight: 700, color: '#d97706', background: '#fffbeb', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>
                          + New
                        </button>
                      </div>
                      {filteredColumn.length === 0 && <div style={{ fontSize: 10, color: '#94a3b8', padding: '5px 10px', fontStyle: 'italic', textAlign: 'center' }}>{fq ? 'No matches' : 'None created yet'}</div>}
                      {filteredColumn.map(c => {
                        const isSel = editingFormulaId === c.column_id;
                        return (
                          <div key={c.column_id} style={{ ...itemStyle(isSel, '#f59e0b'), background: isSel ? '#fffbeb' : 'transparent', border: `1px solid ${isSel ? '#fcd34d' : 'transparent'}` }}
                            onClick={() => { setEditingFormulaId(c.column_id); setFormulaFieldName(c.column_name); setFormulaPlacement('column'); setFormulaCategory('column'); setFormulaTokens(c.formula_tokens || []); setFormulaValidationErrors([]); setFormulaDescription(''); }}>
                            <span style={{ fontSize: 12, marginRight: 6 }}>{'[]'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? '#b45309' : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.column_name}</div>
                              <div style={{ fontSize: 9, color: c.is_visible ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{c.is_visible ? '● Active' : '○ Inactive'}</div>
                            </div>
                            {isSel && (
                              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                <button type="button" title="Duplicate" onClick={e => { e.stopPropagation(); handleDuplicateFormula(c.column_id, true); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Copy style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Toggle" onClick={e => { e.stopPropagation(); handleToggleFormula(c.column_id, true); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: c.is_visible ? '#22c55e' : '#94a3b8' }}><Check style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Delete" onClick={e => { e.stopPropagation(); handleRemoveCustomColumn(c.column_id); if (editingFormulaId === c.column_id) { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); } }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#f43f5e' }}><Trash2 style={{ width: 11, height: 11 }} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{summaryFormulas.length + columnFormulas.length} formula(s) total</div>
                  </div>
                </div>

                {/* RIGHT PANEL – Formula Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

                  {/* Editor Header */}
                  <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>
                        {editingFormulaId ? `Edit Formula: ${editingEntityName}` : 'Create New Formula'}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                        {editingFormulaId ? (formulaPlacement === 'totals' ? 'Summary / Footer Formula' : 'Table Column Formula') : 'Define a new formula for your invoice template'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {editingFormulaId && (() => {
                        const isCol = editingFormulaId.startsWith('col-formula-');
                        const entity = isCol ? columnFormulas.find(c => c.column_id === editingFormulaId) : summaryFormulas.find(f => f.custom_field_id === editingFormulaId);
                        return (
                          <>
                            <button type="button" onClick={() => handleDuplicateFormula(editingFormulaId, isCol)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                              <Copy style={{ width: 11, height: 11 }} /> Duplicate
                            </button>
                            <button type="button" onClick={() => handleToggleFormula(editingFormulaId, isCol)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: entity?.is_visible ? '#22c55e' : '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                              <Check style={{ width: 11, height: 11 }} /> {entity?.is_visible ? 'Enabled' : 'Disabled'}
                            </button>
                          </>
                        );
                      })()}
                      <button type="button" onClick={() => { setShowFormulasModal(false); setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('summary'); setFormulaSearchQuery(''); }}
                        style={{ fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Editor Body */}
                  <div id="formula-editor-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }} className="custom-scrollbar">

                    {/* Validation Errors Banner */}
                    {formulaValidationErrors.length > 0 && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>Validation Errors</div>
                        {formulaValidationErrors.map((err, i) => (
                          <div key={i} style={{ fontSize: 10.5, color: '#ef4444', marginBottom: 2 }}>* {err}</div>
                        ))}
                      </div>
                    )}

                    {/* Name field */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Formula Name *</label>
                      <input type="text" placeholder="e.g. Net Payable, Profit, Balance" value={formulaFieldName}
                        onChange={e => { setFormulaFieldName(e.target.value); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 11.5, border: '1.5px solid #e2e8f0', borderRadius: 7, outline: 'none', color: '#1e293b', background: '#fff' }}
                        onFocus={e => (e.target.style.borderColor = brand.primary)}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                    </div>

                    {/* Formula Builder */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Formula Builder</div>

                      {/* Small Operators Section */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Operators</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {['+', '-', '*', '/', '%', '>', '<', '>=', '<=', '==', '!=', 'AND', 'OR'].map(op => (
                            <button key={op} type="button"
                              onClick={() => { setFormulaTokens(prev => [...prev, { type: 'operator', operator: op as any }]); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }}
                              style={{
                                padding: '3px 8px',
                                minWidth: 24,
                                height: 24,
                                borderRadius: 5,
                                cursor: 'pointer',
                                fontSize: 10,
                                fontWeight: 800,
                                background: ['AND', 'OR'].includes(op) ? '#fdf4ff' : ['>', '<', '>=', '<=', '==', '!='].includes(op) ? '#f0fdf4' : '#fff7ed',
                                color: ['AND', 'OR'].includes(op) ? '#7e22ce' : ['>', '<', '>=', '<=', '==', '!='].includes(op) ? '#166534' : '#c2410c',
                                border: '1px solid',
                                borderColor: ['AND', 'OR'].includes(op) ? '#e9d5ff' : ['>', '<', '>=', '<=', '==', '!='].includes(op) ? '#bbf7d0' : '#ffedd5',
                              }}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fields Section */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {formulaCategory === 'column' ? 'Line-Level Fields' : 'Summary & Totals Fields'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {availableFields.map(f => (
                            <button key={f.key} type="button"
                              onClick={() => { setFormulaTokens(prev => [...prev, { type: 'field', fieldKey: f.key, fieldLabel: f.label }]); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }}
                              style={{ padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 650, background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}
                            >
                              + {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Constant Section */}
                      <div style={{ paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Numeric Constant</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="number" placeholder="e.g. 100, 0.05" value={formulaConstant}
                            onChange={e => setFormulaConstant(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const n = parseFloat(formulaConstant);
                                if (!isNaN(n)) {
                                  setFormulaTokens(prev => [...prev, { type: 'constant', constant: n }]);
                                  setFormulaConstant('');
                                  if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]);
                                }
                              }
                            }}
                            style={{ flex: 1, padding: '5px 10px', fontSize: 11, border: '1.5px solid #e2e8f0', borderRadius: 7, outline: 'none', color: '#1e293b', background: '#fff' }}
                            onFocus={e => (e.target.style.borderColor = '#10b981')}
                            onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                          />
                          <button type="button"
                            onClick={() => {
                              const n = parseFloat(formulaConstant);
                              if (!isNaN(n)) {
                                setFormulaTokens(prev => [...prev, { type: 'constant', constant: n }]);
                                setFormulaConstant('');
                                if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]);
                              }
                            }}
                            style={{ padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#10b981', color: '#fff', border: 'none' }}
                          >
                            Add Constant
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Formula Preview & Management */}
                    {formulaTokens.length > 0 && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#15803d' }}>Formula Preview</div>
                          <button type="button" onClick={() => { setFormulaTokens([]); setFormulaValidationErrors([]); }} style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                            Clear all
                          </button>
                        </div>
                        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, fontFamily: 'monospace', marginBottom: 10 }}>
                          {formulaTokens.map((tok, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, borderRadius: 5, padding: '2px 7px', background: tok.type === 'field' ? '#e0e7ff' : tok.type === 'operator' ? '#fef3c7' : '#dcfce7', color: tok.type === 'field' ? '#4338ca' : tok.type === 'operator' ? '#b45309' : '#15803d' }}>
                              {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : String(tok.constant)}
                              <button type="button" onClick={() => { setFormulaTokens(prev => prev.filter((_, j) => j !== i)); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, fontSize: 12, fontWeight: 800, lineHeight: 1, padding: 0 }}>x</button>
                            </span>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, color: '#16a34a', fontWeight: 700, marginBottom: 4 }}>Sample Result (demo values — Subtotal=7500, Tax=1125, Discount=500, Grand Total=8275):</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontFamily: 'monospace', fontSize: 10.5, color: '#64748b', background: '#f0fdf4', padding: '4px 8px', borderRadius: 5 }}>{expressionStr}</div>
                            <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 16 }}>=</span>
                            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '5px 12px', borderRadius: 6, border: '1px solid #86efac' }}>{previewResult}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editor Footer */}
                  <div style={{ padding: '12px 18px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
                    <div>
                      {editingFormulaId && (
                        <button type="button"
                          onClick={() => { const isCol = editingFormulaId.startsWith('col-formula-'); if (isCol) handleRemoveCustomColumn(editingFormulaId); else handleRemoveCustomField(editingFormulaId); setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#fff1f2', color: '#f43f5e', border: '1.5px solid #fecdd3' }}>
                          <Trash2 style={{ width: 12, height: 12 }} /> Delete Formula
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button"
                        onClick={() => { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('summary'); }}
                        style={{ padding: '7px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                        Cancel
                      </button>
                      <button type="button" onClick={handleValidatedSave}
                        disabled={!formulaFieldName.trim() || formulaTokens.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 18px', borderRadius: 7, cursor: (!formulaFieldName.trim() || formulaTokens.length === 0) ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 800, background: (!formulaFieldName.trim() || formulaTokens.length === 0) ? '#e2e8f0' : brand.primary, color: (!formulaFieldName.trim() || formulaTokens.length === 0) ? '#94a3b8' : '#fff', border: 'none' }}>
                        <Check style={{ width: 13, height: 13 }} />
                        {editingFormulaId ? 'Save Formula' : 'Create Formula'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
        {/* ── Template Settings Modal ── */}
        <Modal
          isOpen={showTemplateSettingsModal}
          onClose={() => setShowTemplateSettingsModal(false)}
          title={`⚙️ Template Settings: ${activeTemplate.template_name}`}
          style={{ width: '40%', maxWidth: '40%' }}
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowTemplateSettingsModal(false)}
              style={{ backgroundColor: brand.primary }}
            >
              Apply Settings
            </Button>
          }
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar py-1">
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Rename Template"
                variant="compact"
                value={activeTemplate.template_name}
                onChange={e => updateTemplateProperty({ template_name: e.target.value })}
              />
              <Select
                label="Document Type"
                variant="compact"
                value={activeTemplate.document_type}
                onChange={e => updateTemplateProperty({ document_type: e.target.value })}
                options={DOCUMENT_TYPES.map(t => ({ value: t, label: t }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Select
                label="Layout Mode"
                variant="compact"
                value={activeTemplate.layout_mode || 'flow'}
                onChange={e => updateTemplateProperty({ layout_mode: e.target.value as any })}
                options={[
                  { value: 'flow', label: 'Flow Layout' },
                  { value: 'free', label: 'Free Layout' }
                ]}
              />
              <Select
                label="Paper Size"
                variant="compact"
                value={activeTemplate.paper_size}
                onChange={e => {
                  const size = e.target.value as any;
                  updateTemplateProperty({
                    paper_size: size,
                    paper_width: size === 'Thermal' ? '80mm' : size === 'A5' ? '148mm' : size === 'Letter' ? '216mm' : '210mm',
                    paper_height: size === 'Thermal' ? 'auto' : size === 'A5' ? '210mm' : size === 'Letter' ? '279mm' : '297mm'
                  });
                }}
                options={PAPER_SIZES.map(t => ({ value: t, label: t }))}
              />
            </div>

            {activeTemplate.paper_size === 'Custom' && (
              <div className="grid grid-cols-2 gap-3.5">
                <Input
                  label="Width (mm)"
                  variant="compact"
                  value={activeTemplate.paper_width || ''}
                  onChange={e => updateTemplateProperty({ paper_width: e.target.value })}
                />
                <Input
                  label="Height (mm)"
                  variant="compact"
                  value={activeTemplate.paper_height || ''}
                  onChange={e => updateTemplateProperty({ paper_height: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <Select
                label="Orientation"
                variant="compact"
                value={activeTemplate.orientation}
                onChange={e => updateTemplateProperty({ orientation: e.target.value as any })}
                options={ORIENTATIONS.map(t => ({ value: t, label: t }))}
              />
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400">Company Logo</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="settings-logo-upload"
                  />
                  <label
                    htmlFor="settings-logo-upload"
                    className="flex-grow flex items-center justify-center border border-dashed rounded-lg py-1.5 px-3 bg-slate-50 text-[10px] font-bold text-slate-650 cursor-pointer hover:bg-slate-100 border-slate-300"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    {activeTemplate.logo_url ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  {activeTemplate.logo_url && (
                    <Button
                      variant="danger"
                      size="xs"
                      icon={Trash2}
                      onClick={() => updateTemplateProperty({ logo_url: undefined })}
                    />
                  )}
                </div>
              </div>
            </div>

            {activeTemplate.logo_url && (
              <div className="space-y-1 bg-slate-50 p-2 rounded-lg border">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Logo Size</span>
                  <span>{activeTemplate.logo_size || 80}px</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={activeTemplate.logo_size || 80}
                  onChange={e => updateTemplateProperty({ logo_size: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                />
              </div>
            )}

            <div className="space-y-2.5 pt-3 border-t">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Advanced Option Toggles</span>
              <div className="grid grid-cols-2 gap-3.5">
                <Toggle
                  checked={activeTemplate.qr_enabled}
                  onChange={val => updateTemplateProperty({ qr_enabled: val })}
                  label="Enable QR Code"
                  compact={true}
                />
                <Toggle
                  checked={activeTemplate.barcode_enabled}
                  onChange={val => updateTemplateProperty({ barcode_enabled: val })}
                  label="Enable Barcode"
                  compact={true}
                />
                <Toggle
                  checked={activeTemplate.signature_enabled}
                  onChange={val => updateTemplateProperty({ signature_enabled: val })}
                  label="Enable Signature Line"
                  compact={true}
                />
                <Toggle
                  checked={activeTemplate.watermark_enabled}
                  onChange={val => updateTemplateProperty({ watermark_enabled: val })}
                  label="Enable Watermark Background"
                  compact={true}
                />
                <Toggle
                  checked={activeTemplate.terms_enabled}
                  onChange={val => updateTemplateProperty({ terms_enabled: val })}
                  label="Enable Terms & Conditions"
                  compact={true}
                />
                <Toggle
                  checked={activeTemplate.remarks_enabled}
                  onChange={val => updateTemplateProperty({ remarks_enabled: val })}
                  label="Enable Invoice Remarks"
                  compact={true}
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* ── Field Properties Modal (Double-Click) ── */}
        <Modal
          isOpen={showFieldPropertiesModal}
          onClose={() => setShowFieldPropertiesModal(false)}
          title={
            selectedField
              ? `✏️ Field Properties: ${selectedField.custom_label || selectedField.field_name}`
              : selectedCustomField
              ? `✏️ Custom Field Properties: ${selectedCustomField.custom_label || selectedCustomField.field_name}`
              : '✏️ Field Properties'
          }
          style={{ width: '40%', maxWidth: '40%' }}
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFieldPropertiesModal(false)}
              style={{ backgroundColor: brand.primary }}
            >
              Save & Apply
            </Button>
          }
        >
          <div className="flex border-b border-slate-200 mb-4 flex-shrink-0">
            {(['content', 'style'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveElementTab(tab)}
                className={`pb-2 px-3 text-xs font-bold capitalize transition-all border-b-2 ${
                  activeElementTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-450 hover:text-slate-650'
                }`}
              >
                {tab === 'content' ? 'Text & Size' : 'Design & Style'}
              </button>
            ))}
          </div>

          <div className="h-[380px] overflow-y-auto pr-1 custom-scrollbar py-1">
            {(() => {
              const activeElement = selectedField || selectedCustomField;
              if (!activeElement) return <p className="text-xs text-slate-400 text-center">No field selected.</p>;
              
              const isCustom = 'custom_field_id' in activeElement;
              const updateProp = (props: any) => {
                if (isCustom) {
                  updateCustomFieldProperty(activeElement.custom_field_id, props);
                } else {
                  updateFieldProperty(activeElement.field_id, props);
                }
              };

              return (
                <div className="space-y-4">
                  {activeElementTab === 'content' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Custom Label"
                          variant="compact"
                          value={activeElement.custom_label || ''}
                          onChange={e => updateProp({ custom_label: e.target.value })}
                          placeholder={activeElement.field_name}
                        />
                        <div className="flex items-center pt-5">
                          <Toggle
                            checked={activeElement.is_visible}
                            onChange={val => updateProp({ is_visible: val })}
                            label="Visibility"
                            compact={true}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <Select
                          label="Width"
                          variant="compact"
                          value={String(activeElement.width_percent || 50)}
                          onChange={e => updateProp({ width_percent: parseInt(e.target.value) })}
                          options={[
                            { value: '100', label: 'Full (100%)' },
                            { value: '50', label: 'Half (50%)' },
                            { value: '33', label: 'One-Third (33%)' },
                            { value: '25', label: 'One-Quarter (25%)' }
                          ]}
                        />
                        <Input
                          label="Height (px)"
                          variant="compact"
                          type="number"
                          value={String(activeElement.height_px || '')}
                          placeholder="Auto"
                          onChange={e =>
                            updateProp({
                              height_px: e.target.value ? Math.max(10, Math.min(2000, parseInt(e.target.value) || 0)) : undefined
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center pt-5">
                          <Toggle
                            checked={!!activeElement.required}
                            onChange={val => updateProp({ required: val })}
                            label="Required Field"
                            compact={true}
                          />
                        </div>
                        <Input
                          label="Default Value"
                          variant="compact"
                          value={activeElement.default_value || ''}
                          onChange={e => updateProp({ default_value: e.target.value })}
                        />
                      </div>

                      {/* Typography Sub-section */}
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Typography</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Font Size (px)"
                            variant="compact"
                            type="number"
                            value={String(activeElement.font_size || 10)}
                            onChange={e => updateProp({ font_size: Math.max(6, Math.min(32, parseInt(e.target.value) || 10)) })}
                          />
                          <Select
                            label="Alignment"
                            variant="compact"
                            value={activeElement.alignment || 'left'}
                            onChange={e => updateProp({ alignment: e.target.value })}
                            options={[
                              { value: 'left', label: 'Left' },
                              { value: 'center', label: 'Center' },
                              { value: 'right', label: 'Right' }
                            ]}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-center pt-2">
                            <Toggle
                              checked={!!activeElement.is_bold}
                              onChange={val => updateProp({ is_bold: val })}
                              label="Bold"
                              compact={true}
                            />
                          </div>
                          <div className="flex items-center pt-2">
                            <Toggle
                              checked={activeElement.label_is_bold !== undefined ? !!activeElement.label_is_bold : !!activeElement.is_bold}
                              onChange={val => updateProp({ label_is_bold: val })}
                              label="Label Bold"
                              compact={true}
                            />
                          </div>
                          <div className="flex items-center pt-2">
                            <Toggle
                              checked={activeElement.value_is_bold !== undefined ? !!activeElement.value_is_bold : !!activeElement.is_bold}
                              onChange={val => updateProp({ value_is_bold: val })}
                              label="Value Bold"
                              compact={true}
                            />
                          </div>
                        </div>
                      </div>

                      {activeTemplate.layout_mode === 'free' ? (
                        <div className="space-y-4 pt-3 border-t border-slate-100">
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Position X (%)"
                              variant="compact"
                              type="number"
                              value={String(activeElement.position_x ?? 5)}
                              onChange={e => updateProp({ position_x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                            />
                            <Input
                              label="Position Y (%)"
                              variant="compact"
                              type="number"
                              value={String(activeElement.position_y ?? 5)}
                              onChange={e => updateProp({ position_y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              label="Margin L (px)"
                              variant="compact"
                              type="number"
                              value={String(activeElement.margin_left ?? 0)}
                              onChange={e => updateProp({ margin_left: Math.max(0, Math.min(500, parseInt(e.target.value) || 0)) })}
                            />
                            <Input
                              label="Margin R (px)"
                              variant="compact"
                              type="number"
                              value={String(activeElement.margin_right ?? 0)}
                              onChange={e => updateProp({ margin_right: Math.max(0, Math.min(500, parseInt(e.target.value) || 0)) })}
                            />
                            <Input
                              label="Margin T (px)"
                              variant="compact"
                              type="number"
                              value={String(activeElement.margin_top ?? 0)}
                              onChange={e => updateProp({ margin_top: Math.max(0, Math.min(500, parseInt(e.target.value) || 0)) })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                          <Input
                            label="Row Position"
                            variant="compact"
                            type="number"
                            min="1"
                            value={String(activeElement.row_position || 1)}
                            onChange={e => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              updateFieldRowPosition(isCustom ? activeElement.custom_field_id : activeElement.field_id, isCustom ? 'custom' : 'default', val);
                            }}
                          />
                          <Input
                            label="Column Position"
                            variant="compact"
                            type="number"
                            min="1"
                            value={String(activeElement.column_position || 1)}
                            onChange={e => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              updateFieldColumnPosition(isCustom ? activeElement.custom_field_id : activeElement.field_id, isCustom ? 'custom' : 'default', val);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeElementTab === 'style' && (
                    <div className="space-y-4">
                      {/* Colors Sub-section */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Colors</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Text Color"
                            variant="compact"
                            value={activeElement.color || ''}
                            onChange={e => updateProp({ color: e.target.value })}
                            placeholder="#000000"
                          />
                          <Input
                            label="Background Color"
                            variant="compact"
                            value={activeElement.background || ''}
                            onChange={e => updateProp({ background: e.target.value })}
                            placeholder="transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Label Color"
                            variant="compact"
                            value={activeElement.label_color || ''}
                            onChange={e => updateProp({ label_color: e.target.value })}
                            placeholder="#64748b"
                          />
                          <Input
                            label="Value Color"
                            variant="compact"
                            value={activeElement.value_color || ''}
                            onChange={e => updateProp({ value_color: e.target.value })}
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {/* Borders & Spacing Sub-section */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Borders & Spacing</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            label="Border Preset"
                            variant="compact"
                            value={activeElement.border || 'none'}
                            onChange={e => updateProp({ border: e.target.value })}
                            options={[
                              { value: 'none', label: 'None' },
                              { value: '1px solid #cbd5e1', label: 'Light Solid' },
                              { value: '1px solid #475569', label: 'Slate Solid' },
                              { value: '1px solid #000000', label: 'Black Solid' },
                              { value: '1px dashed #cbd5e1', label: 'Light Dashed' },
                              { value: 'bottom-light', label: 'Bottom Border (Light)' },
                              { value: 'bottom-slate', label: 'Bottom Border (Slate)' },
                              { value: 'bottom-black', label: 'Bottom Border (Black)' },
                            ]}
                          />
                          <Input
                            label="Custom Border CSS"
                            variant="compact"
                            value={activeElement.border || ''}
                            onChange={e => updateProp({ border: e.target.value })}
                            placeholder="e.g. 1px solid black"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Padding (CSS)"
                            variant="compact"
                            value={activeElement.padding || ''}
                            onChange={e => updateProp({ padding: e.target.value })}
                            placeholder="e.g. 4px 8px"
                          />
                          <Input
                            label="Spacing Below (Margin bottom)"
                            variant="compact"
                            type="number"
                            value={String(activeElement.margin_bottom || 0)}
                            onChange={e => updateProp({ margin_bottom: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                          />
                        </div>

                        <div className="pt-1">
                          <Input
                            label="Custom CSS Code"
                            variant="compact"
                            value={activeElement.custom_css || ''}
                            onChange={e => updateProp({ custom_css: e.target.value })}
                            placeholder="e.g. border-radius: 4px;"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </Modal>

        {/* ── Column Properties Modal (Double-Click) ── */}
        <Modal
          isOpen={showColumnPropertiesModal}
          onClose={() => setShowColumnPropertiesModal(false)}
          title={selectedColumn ? `✏️ Column Properties: ${selectedColumn.custom_label || selectedColumn.column_name}` : '✏️ Column Properties'}
          style={{ width: '40%', maxWidth: '40%' }}
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowColumnPropertiesModal(false)}
              style={{ backgroundColor: brand.primary }}
            >
              Apply Settings
            </Button>
          }
        >
          {selectedColumn && (
            <div className="space-y-4 py-1">
              <Input
                label="Column Label / Text"
                variant="compact"
                value={selectedColumn.custom_label || ''}
                onChange={e => updateColumnProperty(selectedColumn.column_id, { custom_label: e.target.value })}
                placeholder={selectedColumn.column_name}
              />

              <div className="grid grid-cols-2 gap-3.5">
                <Input
                  label="Width"
                  variant="compact"
                  value={selectedColumn.width || ''}
                  onChange={e => updateColumnProperty(selectedColumn.column_id, { width: e.target.value })}
                  placeholder="e.g. 10%, 120px"
                />

                <Select
                  label="Alignment"
                  variant="compact"
                  value={selectedColumn.alignment || 'left'}
                  onChange={e => updateColumnProperty(selectedColumn.column_id, { alignment: e.target.value as any })}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }
                  ]}
                />
              </div>

              <div className="flex items-center pt-2">
                <Toggle
                  checked={selectedColumn.is_visible}
                  onChange={val => updateColumnProperty(selectedColumn.column_id, { is_visible: val })}
                  label="Column Visibility"
                  compact={true}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* ── Section Properties Modal (Double-Click) ── */}
        <Modal
          isOpen={showSectionPropertiesModal}
          onClose={() => setShowSectionPropertiesModal(false)}
          title={selectedSectionId ? `✏️ Section Properties: ${allSections.find(s => s.section_id === selectedSectionId)?.section_name}` : '✏️ Section Properties'}
          style={{ width: '40%', maxWidth: '40%' }}
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSectionPropertiesModal(false)}
              style={{ backgroundColor: brand.primary }}
            >
              Apply Settings
            </Button>
          }
        >
          {(() => {
            const secObj = allSections.find(s => s.section_id === selectedSectionId);
            if (!secObj) return <p className="text-xs text-slate-400">No section selected.</p>;
            return (
              <div className="space-y-4 py-1">
                <Input
                  label="Section Name"
                  variant="compact"
                  value={secObj.section_name}
                  onChange={e => updateSectionProperty(secObj.section_id, { section_name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3.5">
                  <Input
                    label="Spacing Below (px)"
                    variant="compact"
                    type="number"
                    value={String(secObj.spacing ?? 0)}
                    onChange={e => updateSectionProperty(secObj.section_id, { spacing: Math.max(0, parseInt(e.target.value) || 0) })}
                  />

                  <Select
                    label="Layout"
                    variant="compact"
                    value={secObj.layout || 'grid'}
                    onChange={e => updateSectionProperty(secObj.section_id, { layout: e.target.value as any })}
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'flex', label: 'Flexbox' },
                      { value: 'row', label: 'Row Flow' }
                    ]}
                  />
                </div>

                <div className="flex items-center pt-2">
                  <Toggle
                    checked={secObj.is_visible}
                    onChange={val => updateSectionProperty(secObj.section_id, { is_visible: val })}
                    label="Section Visibility"
                    compact={true}
                  />
                </div>
              </div>
            );
          })()}
        </Modal>

      </div>
    );
  }

  // ─── List View ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search template name, document..."
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Import Template Config file selector */}
          <input
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            variant="white"
            size="md"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>

          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempDocType(filterDocType);
              setTempPaper(filterPaper);
              setShowFilter(true);
            }}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openAdd}
            style={{ backgroundColor: brand.primary }}
          >
            Add Template
          </Button>
        </div>
      </div>

      {/* Templates List Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Print Templates</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} layouts
            </span>
          </div>
        </div>

        <ScrollArea height="290px" className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                {[
                  { label: 'Template Name', key: 'template_name' as keyof PrintTemplate, w: 'min-w-[150px]' },
                  { label: 'Document Type', key: 'document_type' as keyof PrintTemplate, w: 'min-w-[120px]' },
                  { label: 'Paper Size', key: 'paper_size' as keyof PrintTemplate, w: 'min-w-[100px]' },
                  { label: 'Orientation', key: 'orientation' as keyof PrintTemplate, w: 'min-w-[90px]' },
                  { label: 'Default', key: undefined, w: 'min-w-[80px]' },
                  { label: 'Status', key: undefined, w: 'min-w-[80px]' },
                  { label: 'Actions', key: undefined, w: 'w-24' }
                ].map(h => (
                  <TableHeader
                    key={h.label}
                    label={h.label}
                    sortKey={h.key}
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={h.key ? () => handleSort(h.key!) : undefined}
                    width={h.w}
                    padding={h.label === 'Actions' ? 'px-2' : 'px-4'}
                    borderLeft={false}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-slate-400">
                    No print templates found.
                  </td>
                </tr>
              ) : (
                paginated.map((t, i) => (
                  <motion.tr
                    key={t.template_id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-[12px] font-bold text-slate-700">
                      {t.template_name}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650">
                      {t.document_type}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650">
                      {t.paper_size}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650">
                      {t.orientation}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.is_default ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(t)}
                          className="text-[9px] font-black text-blue-500 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.is_active ? (
                        <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(t.template_id)} />
                      ) : (
                        <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(t.template_id)} />
                      )}
                    </td>
                    <td className="px-2 py-2.5 w-24">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Pencil}
                          title="Design"
                          className="!px-1 text-blue-500 hover:text-blue-800"
                          onClick={() => {
                            setCurrentTemplateId(t.template_id);
                            setView('designer');
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Settings}
                          title="Edit Details"
                          className="!px-1 text-slate-500"
                          onClick={() => openEditBasic(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Copy}
                          title="Duplicate"
                          className="!px-1 text-slate-500"
                          onClick={() => handleDuplicate(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Download}
                          title="Export JSON"
                          className="!px-1 text-emerald-500 hover:text-emerald-700"
                          onClick={() => handleExportTemplate(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          title="Delete"
                          className="!px-1 !text-red-500"
                          onClick={() => handleDeleteTrigger(t.template_id, t.template_name)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: '#E2E8F0', background: brand.surface + '60' }}
          >
            <p className="text-[11px] font-medium text-slate-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white"
                size="xs"
                icon={ChevronLeft}
                className="w-8 h-8 px-0"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'}
                  size="xs"
                  className="w-8 h-8 px-0 border-none"
                  style={currentPage === p ? { backgroundColor: brand.primary } : undefined}
                >
                  {p}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white"
                size="xs"
                icon={ChevronRight}
                className="w-8 h-8 px-0"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Add / Edit modal popup drawer */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingTemplate ? 'Edit Template Basics' : 'Create Print Template'}
        size="md"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSaveBasic}
              style={{ backgroundColor: brand.primary }}
            >
              {editingTemplate ? 'Update basics' : 'Create Template'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {formError}
            </div>
          )}

          <Input
            label="Template Name *"
            variant="compact"
            placeholder="e.g. A4 Tax Layout"
            value={form.template_name}
            onChange={e => setForm({ ...form, template_name: e.target.value })}
          />

          <Select
            label="Document Type"
            variant="compact"
            value={form.document_type}
            onChange={e => setForm({ ...form, document_type: e.target.value })}
            options={DOCUMENT_TYPES.map(t => ({ value: t, label: t }))}
          />

          <Select
            label="Paper Size"
            variant="compact"
            value={form.paper_size}
            onChange={e => setForm({ ...form, paper_size: e.target.value as any })}
            options={PAPER_SIZES.map(t => ({ value: t, label: t }))}
          />

          <Select
            label="Orientation"
            variant="compact"
            value={form.orientation}
            onChange={e => setForm({ ...form, orientation: e.target.value as any })}
            options={ORIENTATIONS.map(t => ({ value: t, label: t }))}
          />

          <div className="flex items-center justify-between pt-2">
            <Toggle
              checked={form.is_default}
              onChange={val => setForm({ ...form, is_default: val })}
              label="Set as default template for this document type"
              compact={true}
            />
          </div>

          <div className="flex items-center justify-between">
            <Toggle
              checked={form.is_active}
              onChange={val => setForm({ ...form, is_active: val })}
              label="Active"
              compact={true}
            />
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleResetFilters}
        onApply={() => {
          setFilterDocType(tempDocType);
          setFilterPaper(tempPaper);
          setCurrentPage(1);
          setShowFilter(false);
        }}
        title="Filter Templates"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Document Type</label>
          <Select
            variant="compact"
            value={tempDocType}
            onChange={e => setTempDocType(e.target.value)}
            options={[{ value: 'all', label: 'All Document Types' }, ...DOCUMENT_TYPES.map(t => ({ value: t, label: t }))]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Paper Size</label>
          <Select
            variant="compact"
            value={tempPaper}
            onChange={e => setTempPaper(e.target.value)}
            options={[{ value: 'all', label: 'All Paper Sizes' }, ...PAPER_SIZES.map(t => ({ value: t, label: t }))]}
          />
        </div>
      </FilterDrawer>

      {/* Delete Confirmation popup */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Print Template?"
        itemName={deleteModal.name}
        warningText="Warning: Deleting this template will permanently clear all its visual coordinates and styling properties. This action cannot be undone."
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant || "warning"}
      />
    </div>
  );
};
